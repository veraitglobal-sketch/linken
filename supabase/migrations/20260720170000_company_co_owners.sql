-- Shared (joint venture) ownership: a child company can have more than one
-- confirmed parent. The PRIMARY parent stays exactly as-is in
-- company_group_members.parent_company_id — drives tree layout/positioning,
-- zero change to existing single-parent logic. This table adds EXTRA
-- confirmed owners on top, purely additive. On the map the child still
-- renders ONCE, with an additional solid "Owns" edge drawn from each
-- confirmed co-parent into the same node.

create table public.company_co_owners (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.company_groups (id) on delete cascade,
  child_company_id uuid not null references public.companies (id) on delete cascade,
  co_parent_company_id uuid not null references public.companies (id) on delete cascade,
  -- which side proposed — the OTHER side must confirm (sacred rule: never self-confirm)
  proposed_by_company_id uuid not null references public.companies (id) on delete cascade,
  proposed_by uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined', 'ended')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  ended_at timestamptz,
  constraint co_owner_no_self check (child_company_id <> co_parent_company_id),
  constraint co_owner_proposer_is_party check (
    proposed_by_company_id in (child_company_id, co_parent_company_id)
  ),
  constraint co_owner_unique unique (group_id, child_company_id, co_parent_company_id)
);

create index company_co_owners_child_idx
  on public.company_co_owners (child_company_id, status);
create index company_co_owners_parent_idx
  on public.company_co_owners (co_parent_company_id, status);

alter table public.company_co_owners enable row level security;

create policy "co_owners_public_confirmed"
on public.company_co_owners for select
using (status = 'confirmed');

create policy "co_owners_party_select"
on public.company_co_owners for select
to authenticated
using (
  public.is_company_operator(child_company_id)
  or public.is_company_operator(co_parent_company_id)
);

-- No direct insert/update/delete grants — security definer functions only.
revoke all on public.company_co_owners from anon, authenticated;
grant select (
  id, group_id, child_company_id, co_parent_company_id,
  proposed_by_company_id, status, created_at, confirmed_at
) on public.company_co_owners to anon, authenticated;

-- ---------------------------------------------------------------------------
-- propose_co_ownership — either side proposes, cycle-safe, group-scoped
-- ---------------------------------------------------------------------------

create or replace function public.propose_co_ownership(
  p_group_id uuid,
  p_child_company_id uuid,
  p_co_parent_company_id uuid,
  p_as_company_id uuid
)
returns public.company_co_owners
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.company_co_owners;
  v_primary_parent uuid;
  v_child_status text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_child_company_id = p_co_parent_company_id then
    raise exception 'A company cannot co-own itself';
  end if;

  if p_as_company_id not in (p_child_company_id, p_co_parent_company_id) then
    raise exception 'Invalid proposer';
  end if;

  if not public.is_company_operator(p_as_company_id) then
    raise exception 'Not allowed to act for that company';
  end if;

  select status into v_child_status
  from public.company_group_members
  where group_id = p_group_id and company_id = p_child_company_id;

  if v_child_status is distinct from 'confirmed' then
    raise exception 'Child must be a confirmed member of this group';
  end if;

  if not exists (
    select 1 from public.company_group_members
    where group_id = p_group_id
      and company_id = p_co_parent_company_id
      and status = 'confirmed'
  ) then
    raise exception 'Proposed co-owner must be a confirmed member of this group';
  end if;

  select parent_company_id into v_primary_parent
  from public.company_group_members
  where group_id = p_group_id and company_id = p_child_company_id;

  if v_primary_parent = p_co_parent_company_id then
    raise exception 'Already the primary parent';
  end if;

  if exists (
    select 1 from public.company_co_owners
    where child_company_id = p_child_company_id
      and co_parent_company_id = p_co_parent_company_id
      and status in ('pending', 'confirmed')
  ) then
    raise exception 'Already proposed or confirmed';
  end if;

  -- Cycle safety: the proposed co-parent must not be a descendant of the
  -- child in the PRIMARY tree (walking company_group_members.parent_company_id).
  if exists (
    with recursive descendants as (
      select company_id
      from public.company_group_members
      where group_id = p_group_id
        and parent_company_id = p_child_company_id
        and status = 'confirmed'
      union all
      select m.company_id
      from public.company_group_members m
      join descendants d on m.parent_company_id = d.company_id
      where m.group_id = p_group_id and m.status = 'confirmed'
    )
    select 1 from descendants where company_id = p_co_parent_company_id
  ) then
    raise exception 'Would create an ownership cycle';
  end if;

  insert into public.company_co_owners (
    group_id, child_company_id, co_parent_company_id,
    proposed_by_company_id, proposed_by
  )
  values (
    p_group_id, p_child_company_id, p_co_parent_company_id,
    p_as_company_id, auth.uid()
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.propose_co_ownership(uuid, uuid, uuid, uuid) from public;
grant execute on function public.propose_co_ownership(uuid, uuid, uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- respond_co_ownership — ONLY the non-proposing side may confirm/decline
-- ---------------------------------------------------------------------------

create or replace function public.respond_co_ownership(
  p_edge_id uuid,
  p_decision text,
  p_as_company_id uuid
)
returns public.company_co_owners
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.company_co_owners;
  v_other_side uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if p_decision not in ('confirmed', 'declined') then
    raise exception 'Invalid decision';
  end if;

  select * into v_row
  from public.company_co_owners
  where id = p_edge_id
  for update;

  if v_row.id is null then
    raise exception 'Not found';
  end if;
  if v_row.status <> 'pending' then
    raise exception 'Already resolved';
  end if;

  v_other_side := case
    when v_row.proposed_by_company_id = v_row.child_company_id
      then v_row.co_parent_company_id
    else v_row.child_company_id
  end;

  if p_as_company_id <> v_other_side then
    raise exception 'Only the other party can respond';
  end if;
  if not public.is_company_operator(p_as_company_id) then
    raise exception 'Not allowed to act for that company';
  end if;

  update public.company_co_owners
  set status = p_decision,
      confirmed_at = case when p_decision = 'confirmed' then now() else null end
  where id = p_edge_id
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.respond_co_ownership(uuid, text, uuid) from public;
grant execute on function public.respond_co_ownership(uuid, text, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- end_co_ownership — either party may unilaterally end a confirmed link
-- ---------------------------------------------------------------------------

create or replace function public.end_co_ownership(
  p_edge_id uuid,
  p_as_company_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.company_co_owners;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_row
  from public.company_co_owners
  where id = p_edge_id
  for update;

  if v_row.id is null then
    raise exception 'Not found';
  end if;
  if v_row.status <> 'confirmed' then
    raise exception 'Not an active co-ownership';
  end if;
  if p_as_company_id not in (v_row.child_company_id, v_row.co_parent_company_id) then
    raise exception 'Not a party to this link';
  end if;
  if not public.is_company_operator(p_as_company_id) then
    raise exception 'Not allowed to act for that company';
  end if;

  update public.company_co_owners
  set status = 'ended', ended_at = now()
  where id = p_edge_id;
end;
$$;

revoke all on function public.end_co_ownership(uuid, uuid) from public;
grant execute on function public.end_co_ownership(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Pending co-ownership proposals for the viewer (dashboard surfacing)
-- ---------------------------------------------------------------------------

create or replace function public.get_pending_co_owner_proposals(p_company_id uuid)
returns table (
  id uuid,
  group_id uuid,
  child_company_id uuid,
  child_name text,
  child_slug text,
  co_parent_company_id uuid,
  co_parent_name text,
  co_parent_slug text,
  proposed_by_company_id uuid,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_company_operator(p_company_id) then
    raise exception 'Not allowed';
  end if;

  return query
  select
    co.id, co.group_id,
    co.child_company_id, cc.name, cc.slug,
    co.co_parent_company_id, pc.name, pc.slug,
    co.proposed_by_company_id, co.created_at
  from public.company_co_owners co
  join public.companies cc on cc.id = co.child_company_id
  join public.companies pc on pc.id = co.co_parent_company_id
  where co.status = 'pending'
    and (
      (co.child_company_id = p_company_id and co.proposed_by_company_id <> p_company_id)
      or (co.co_parent_company_id = p_company_id and co.proposed_by_company_id <> p_company_id)
    );
end;
$$;

revoke all on function public.get_pending_co_owner_proposals(uuid) from public;
grant execute on function public.get_pending_co_owner_proposals(uuid) to authenticated;
