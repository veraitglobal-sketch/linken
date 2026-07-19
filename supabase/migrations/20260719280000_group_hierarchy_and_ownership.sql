-- Group hierarchy (parent tree) + membership end + ownership transfer
--
-- Re-invite after 'ended': UPDATE same PK row back to pending (overwrites
-- ended_at/ended_by). Simpler than previous_membership jsonb history.

-- ─── Hierarchy + membership end columns ──────────────────────────────────

alter table public.company_group_members
  drop constraint if exists company_group_members_status_check;

alter table public.company_group_members
  add column if not exists parent_company_id uuid
    references public.companies (id) on delete set null,
  add column if not exists pending_parent_company_id uuid
    references public.companies (id) on delete set null,
  add column if not exists ended_at timestamptz,
  add column if not exists ended_by text
    check (ended_by is null or ended_by in ('company', 'group'));

alter table public.company_group_members
  add constraint company_group_members_status_check
  check (status in ('pending', 'confirmed', 'declined', 'ended'));

alter table public.company_group_members
  drop constraint if exists company_group_members_no_self_parent;

alter table public.company_group_members
  add constraint company_group_members_no_self_parent
  check (
    parent_company_id is null
    or parent_company_id <> company_id
  );

-- ─── Parent validation (same group, confirmed, no cycles) ────────────────

create or replace function public.validate_group_parent(
  p_group_id uuid,
  p_company_id uuid,
  p_parent_id uuid
)
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_parent_id is null then
    return;
  end if;

  if p_parent_id = p_company_id then
    raise exception 'A company cannot be its own parent';
  end if;

  if not exists (
    select 1
    from public.company_group_members m
    where m.group_id = p_group_id
      and m.company_id = p_parent_id
      and m.status = 'confirmed'
  ) then
    raise exception 'Parent must be a confirmed member of the same group';
  end if;

  -- Cycle: walk ancestors of parent; none may be the child
  if exists (
    with recursive ancestors as (
      select m.parent_company_id as id, 1 as depth
      from public.company_group_members m
      where m.group_id = p_group_id
        and m.company_id = p_parent_id
        and m.status = 'confirmed'
      union all
      select m2.parent_company_id, a.depth + 1
      from public.company_group_members m2
      join ancestors a on m2.company_id = a.id
      where m2.group_id = p_group_id
        and m2.status = 'confirmed'
        and a.depth < 32
        and m2.parent_company_id is not null
    )
    select 1 from ancestors where id = p_company_id
  ) then
    raise exception 'Parent assignment would create a cycle';
  end if;
end;
$$;

revoke all on function public.validate_group_parent(uuid, uuid, uuid) from public;
grant execute on function public.validate_group_parent(uuid, uuid, uuid) to authenticated;

-- ─── Replace create_group_subsidiary (optional parent) ───────────────────

drop function if exists public.create_group_subsidiary(uuid, text, text, text, text, text, uuid);

create or replace function public.create_group_subsidiary(
  p_group_id uuid,
  p_name text,
  p_category text,
  p_city text,
  p_country text,
  p_slug text,
  p_claim_token uuid,
  p_parent_company_id uuid default null
)
returns table (
  company_id uuid,
  company_slug text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid;
  v_seed_company uuid;
  v_company_id uuid;
  v_allowed boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select created_by into v_creator
  from public.company_groups
  where id = p_group_id;

  if v_creator is null then
    raise exception 'Group not found';
  end if;

  if v_creator = auth.uid() then
    v_allowed := true;
  end if;

  if p_parent_company_id is not null
     and public.is_company_owner(p_parent_company_id) then
    -- Parent owner may grow their own subtree
    if exists (
      select 1 from public.company_group_members m
      where m.group_id = p_group_id
        and m.company_id = p_parent_company_id
        and m.status = 'confirmed'
    ) then
      v_allowed := true;
    end if;
  end if;

  if not v_allowed then
    raise exception 'Not allowed to create a subsidiary here';
  end if;

  if coalesce(trim(p_name), '') = ''
     or coalesce(trim(p_category), '') = ''
     or coalesce(trim(p_city), '') = '' then
    raise exception 'Name, category, and city are required';
  end if;

  -- New company has no id yet — only verify parent is a confirmed member
  if p_parent_company_id is not null then
    if not exists (
      select 1 from public.company_group_members m
      where m.group_id = p_group_id
        and m.company_id = p_parent_company_id
        and m.status = 'confirmed'
    ) then
      raise exception 'Parent must be a confirmed member of the same group';
    end if;
  end if;

  select c.id into v_seed_company
  from public.companies c
  where c.owner_id = auth.uid()
    and c.claimed = true
  order by c.created_at asc
  limit 1;

  if p_parent_company_id is not null then
    v_seed_company := coalesce(p_parent_company_id, v_seed_company);
  end if;

  insert into public.companies (
    owner_id, claimed, claim_token, created_by_company_id,
    name, slug, category, city, country, tagline, description, services, verified
  )
  values (
    null, false, p_claim_token, v_seed_company,
    trim(p_name), p_slug, trim(p_category), trim(p_city),
    coalesce(trim(p_country), ''),
    trim(p_category) || ' · ' || trim(p_city),
    'Branch profile created within the group. Claim this page to manage it locally.',
    '{}', false
  )
  returning id into v_company_id;

  insert into public.company_group_members (
    group_id, company_id, status, confirmed_at, parent_company_id
  )
  values (
    p_group_id, v_company_id, 'confirmed', now(), p_parent_company_id
  );

  return query select v_company_id, p_slug;
end;
$$;

revoke all on function public.create_group_subsidiary(uuid, text, text, text, text, text, uuid, uuid) from public;
grant execute on function public.create_group_subsidiary(uuid, text, text, text, text, text, uuid, uuid) to authenticated;

-- ─── Invite / re-invite (ended → pending) ────────────────────────────────

create or replace function public.upsert_group_invite(
  p_group_id uuid,
  p_company_id uuid,
  p_parent_company_id uuid default null
)
returns public.company_group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid;
  v_row public.company_group_members;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select created_by into v_creator
  from public.company_groups where id = p_group_id;

  if v_creator is null or v_creator <> auth.uid() then
    raise exception 'Only the group creator can invite';
  end if;

  if p_parent_company_id is not null then
    perform public.validate_group_parent(
      p_group_id, p_company_id, p_parent_company_id
    );
  end if;

  select * into v_row
  from public.company_group_members
  where group_id = p_group_id and company_id = p_company_id;

  if v_row.company_id is null then
    insert into public.company_group_members (
      group_id, company_id, status, parent_company_id
    )
    values (p_group_id, p_company_id, 'pending', p_parent_company_id)
    returning * into v_row;
    return v_row;
  end if;

  if v_row.status = 'confirmed' then
    raise exception 'Company is already a confirmed member';
  end if;

  if v_row.status = 'pending' then
    raise exception 'Invite already pending';
  end if;

  -- ended / declined → re-invite (overwrite ended_* — documented choice)
  update public.company_group_members
  set
    status = 'pending',
    invited_at = now(),
    confirmed_at = null,
    ended_at = null,
    ended_by = null,
    parent_company_id = p_parent_company_id,
    pending_parent_company_id = null
  where group_id = p_group_id and company_id = p_company_id
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.upsert_group_invite(uuid, uuid, uuid) from public;
grant execute on function public.upsert_group_invite(uuid, uuid, uuid) to authenticated;

-- Respond membership (keeps parent_company_id from invite)
create or replace function public.respond_group_membership(
  p_group_id uuid,
  p_company_id uuid,
  p_decision text
)
returns public.company_group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.company_group_members;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_decision not in ('confirmed', 'declined') then
    raise exception 'Invalid decision';
  end if;

  if not public.is_company_owner(p_company_id) then
    raise exception 'Only the company owner can respond to a group invite';
  end if;

  update public.company_group_members
  set
    status = p_decision,
    confirmed_at = case when p_decision = 'confirmed' then now() else null end,
    -- clear parent if declined
    parent_company_id = case
      when p_decision = 'confirmed' then parent_company_id
      else null
    end
  where group_id = p_group_id
    and company_id = p_company_id
    and status = 'pending'
  returning * into v_row;

  if v_row.company_id is null then
    raise exception 'No pending membership found';
  end if;

  if p_decision = 'confirmed' and v_row.parent_company_id is not null then
    perform public.validate_group_parent(
      p_group_id, p_company_id, v_row.parent_company_id
    );
  end if;

  return v_row;
end;
$$;

-- Propose parent for an already-confirmed member
create or replace function public.propose_group_parent(
  p_group_id uuid,
  p_company_id uuid,
  p_parent_company_id uuid
)
returns public.company_group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid;
  v_row public.company_group_members;
  v_allowed boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select created_by into v_creator
  from public.company_groups where id = p_group_id;

  if v_creator = auth.uid() then
    v_allowed := true;
  end if;
  if public.is_company_owner(p_parent_company_id) then
    v_allowed := true;
  end if;
  if not v_allowed then
    raise exception 'Not allowed to propose a parent';
  end if;

  perform public.validate_group_parent(
    p_group_id, p_company_id, p_parent_company_id
  );

  update public.company_group_members
  set pending_parent_company_id = p_parent_company_id
  where group_id = p_group_id
    and company_id = p_company_id
    and status = 'confirmed'
  returning * into v_row;

  if v_row.company_id is null then
    raise exception 'Company is not a confirmed member';
  end if;

  return v_row;
end;
$$;

revoke all on function public.propose_group_parent(uuid, uuid, uuid) from public;
grant execute on function public.propose_group_parent(uuid, uuid, uuid) to authenticated;

-- Child owner accepts/declines parent attachment (respond_ownership)
create or replace function public.respond_group_parent(
  p_group_id uuid,
  p_company_id uuid,
  p_decision text
)
returns public.company_group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.company_group_members;
  v_parent uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_decision not in ('confirmed', 'declined') then
    raise exception 'Invalid decision';
  end if;

  if not public.is_company_owner(p_company_id) then
    raise exception 'Only the company owner can respond to a parent proposal';
  end if;

  select pending_parent_company_id into v_parent
  from public.company_group_members
  where group_id = p_group_id
    and company_id = p_company_id
    and status = 'confirmed'
    and pending_parent_company_id is not null;

  if v_parent is null then
    raise exception 'No pending parent proposal';
  end if;

  if p_decision = 'confirmed' then
    perform public.validate_group_parent(p_group_id, p_company_id, v_parent);
    update public.company_group_members
    set
      parent_company_id = v_parent,
      pending_parent_company_id = null
    where group_id = p_group_id and company_id = p_company_id
    returning * into v_row;
  else
    update public.company_group_members
    set pending_parent_company_id = null
    where group_id = p_group_id and company_id = p_company_id
    returning * into v_row;
  end if;

  return v_row;
end;
$$;

revoke all on function public.respond_group_parent(uuid, uuid, text) from public;
grant execute on function public.respond_group_parent(uuid, uuid, text) to authenticated;

-- ─── End membership (leave / remove) ─────────────────────────────────────

create or replace function public.end_group_membership(
  p_group_id uuid,
  p_company_id uuid
)
returns public.company_group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid;
  v_ended_by text;
  v_row public.company_group_members;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select created_by into v_creator
  from public.company_groups where id = p_group_id;

  if public.is_company_owner(p_company_id) then
    v_ended_by := 'company';
  elsif v_creator = auth.uid() then
    v_ended_by := 'group';
  else
    raise exception 'Only the company owner or group creator can end membership';
  end if;

  update public.company_group_members
  set
    status = 'ended',
    ended_at = now(),
    ended_by = v_ended_by,
    parent_company_id = null,
    pending_parent_company_id = null
  where group_id = p_group_id
    and company_id = p_company_id
    and status = 'confirmed'
  returning * into v_row;

  if v_row.company_id is null then
    raise exception 'No confirmed membership to end';
  end if;

  -- Children keep their parent_company_id pointing at this company
  -- (sold together). Only this firm's link to the group/hub is cleared.

  return v_row;
end;
$$;

revoke all on function public.end_group_membership(uuid, uuid) from public;
grant execute on function public.end_group_membership(uuid, uuid) to authenticated;

-- ─── Ownership transfers ─────────────────────────────────────────────────

create table public.ownership_transfers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  current_owner_id uuid not null references auth.users (id) on delete cascade,
  invite_email text not null,
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'cancelled')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index ownership_transfers_company_idx
  on public.ownership_transfers (company_id, status);

alter table public.ownership_transfers enable row level security;

-- Owners see their transfers without token
create policy "ownership_transfers_owner_select"
on public.ownership_transfers for select
to authenticated
using (
  public.is_company_owner(company_id)
  or current_owner_id = auth.uid()
);

revoke all on public.ownership_transfers from anon, authenticated;
grant select (
  id, company_id, current_owner_id, invite_email, status, created_at, resolved_at
) on public.ownership_transfers to authenticated;

create or replace function public.get_ownership_transfer_preview(p_token uuid)
returns table (
  company_id uuid,
  company_name text,
  company_slug text,
  invite_email text,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.name,
    c.slug,
    t.invite_email,
    t.status
  from public.ownership_transfers t
  join public.companies c on c.id = t.company_id
  where t.token = p_token;
$$;

revoke all on function public.get_ownership_transfer_preview(uuid) from public;
grant execute on function public.get_ownership_transfer_preview(uuid) to anon, authenticated;

create or replace function public.accept_ownership_transfer(p_token uuid)
returns public.companies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transfer public.ownership_transfers;
  v_company public.companies;
  v_old_owner uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_transfer
  from public.ownership_transfers
  where token = p_token
    and status = 'pending'
  for update;

  if v_transfer.id is null then
    raise exception 'Transfer not found or already resolved';
  end if;

  -- Recipient must not already own another claimed company
  if exists (
    select 1 from public.companies c
    where c.owner_id = auth.uid()
      and c.claimed = true
      and c.id <> v_transfer.company_id
  ) then
    raise exception 'You already own a claimed company';
  end if;

  select * into v_company
  from public.companies
  where id = v_transfer.company_id
  for update;

  if v_company.owner_id is distinct from v_transfer.current_owner_id then
    raise exception 'Ownership changed; transfer is no longer valid';
  end if;

  v_old_owner := v_company.owner_id;

  update public.companies
  set owner_id = auth.uid()
  where id = v_company.id
  returning * into v_company;

  -- New owner row (trigger also upserts owner)
  insert into public.company_members (company_id, user_id, role)
  values (v_company.id, auth.uid(), 'owner')
  on conflict (company_id, user_id) do update set role = 'owner';

  -- Former owner becomes member (may be removed later)
  update public.company_members
  set role = 'member'
  where company_id = v_company.id
    and user_id = v_old_owner;

  insert into public.company_members (company_id, user_id, role)
  values (v_company.id, v_old_owner, 'member')
  on conflict (company_id, user_id) do update set role = 'member';

  update public.ownership_transfers
  set status = 'accepted', resolved_at = now()
  where id = v_transfer.id;

  -- Cancel other pending transfers for this company
  update public.ownership_transfers
  set status = 'cancelled', resolved_at = now()
  where company_id = v_company.id
    and status = 'pending'
    and id <> v_transfer.id;

  return v_company;
end;
$$;

revoke all on function public.accept_ownership_transfer(uuid) from public;
grant execute on function public.accept_ownership_transfer(uuid) to authenticated;

create or replace function public.create_ownership_transfer(
  p_company_id uuid,
  p_invite_email text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token uuid;
begin
  if auth.uid() is null or not public.is_company_owner(p_company_id) then
    raise exception 'Only the current owner can transfer ownership';
  end if;

  -- Cancel existing pending
  update public.ownership_transfers
  set status = 'cancelled', resolved_at = now()
  where company_id = p_company_id and status = 'pending';

  insert into public.ownership_transfers (
    company_id, current_owner_id, invite_email
  )
  values (
    p_company_id, auth.uid(), lower(trim(p_invite_email))
  )
  returning token into v_token;

  return v_token;
end;
$$;

revoke all on function public.create_ownership_transfer(uuid, text) from public;
grant execute on function public.create_ownership_transfer(uuid, text) to authenticated;

create or replace function public.cancel_ownership_transfer(p_company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_company_owner(p_company_id) then
    raise exception 'Only the current owner can cancel a transfer';
  end if;

  update public.ownership_transfers
  set status = 'cancelled', resolved_at = now()
  where company_id = p_company_id and status = 'pending';
end;
$$;

revoke all on function public.cancel_ownership_transfer(uuid) from public;
grant execute on function public.cancel_ownership_transfer(uuid) to authenticated;
