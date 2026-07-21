-- Shared ownership needs two more things to be useful:
-- 1. A recorded percentage + ownership type (equity, joint venture, etc.) —
--    not just "these two firms share ownership" with no detail.
-- 2. The co-parent no longer has to be a confirmed GROUP member — a
--    confirmed PARTNER of the child company can now also be proposed as a
--    co-owner. This covers "1 firma i partner mogu da dele firmu".

alter table public.company_co_owners
  add column ownership_percentage numeric(5, 2)
    check (ownership_percentage is null or (ownership_percentage > 0 and ownership_percentage <= 100)),
  add column ownership_type text
    check (
      ownership_type is null or ownership_type in (
        'equity', 'joint_venture', 'private_equity', 'shareholding', 'family', 'other'
      )
    );

revoke all on public.company_co_owners from anon, authenticated;
grant select (
  id, group_id, child_company_id, co_parent_company_id,
  proposed_by_company_id, status, created_at, confirmed_at,
  ownership_percentage, ownership_type
) on public.company_co_owners to anon, authenticated;

-- ---------------------------------------------------------------------------
-- propose_co_ownership — co-parent is now either a confirmed group member
-- OR a confirmed partner of the child. Adds percentage + type.
-- ---------------------------------------------------------------------------

drop function if exists public.propose_co_ownership(uuid, uuid, uuid, uuid);

create or replace function public.propose_co_ownership(
  p_group_id uuid,
  p_child_company_id uuid,
  p_co_parent_company_id uuid,
  p_as_company_id uuid,
  p_ownership_percentage numeric default null,
  p_ownership_type text default null
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
  v_co_parent_is_member boolean;
  v_co_parent_is_partner boolean;
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

  if p_ownership_percentage is not null
    and (p_ownership_percentage <= 0 or p_ownership_percentage > 100) then
    raise exception 'Ownership percentage must be between 0 and 100';
  end if;

  if p_ownership_type is not null
    and p_ownership_type not in (
      'equity', 'joint_venture', 'private_equity', 'shareholding', 'family', 'other'
    ) then
    raise exception 'Invalid ownership type';
  end if;

  select status into v_child_status
  from public.company_group_members
  where group_id = p_group_id and company_id = p_child_company_id;

  if v_child_status is distinct from 'confirmed' then
    raise exception 'Child must be a confirmed member of this group';
  end if;

  select exists (
    select 1 from public.company_group_members
    where group_id = p_group_id
      and company_id = p_co_parent_company_id
      and status = 'confirmed'
  ) into v_co_parent_is_member;

  select exists (
    select 1 from public.partnerships
    where status = 'accepted'
      and (
        (requester_id = p_child_company_id and recipient_id = p_co_parent_company_id)
        or (requester_id = p_co_parent_company_id and recipient_id = p_child_company_id)
      )
  ) into v_co_parent_is_partner;

  if not v_co_parent_is_member and not v_co_parent_is_partner then
    raise exception 'Proposed co-owner must be a confirmed group member or a confirmed partner';
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

  -- Cycle safety: only meaningful within the primary tree — an external
  -- partner co-owner is never a descendant of the child, so this only
  -- bites when the co-parent is a fellow group member.
  if v_co_parent_is_member and exists (
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
    proposed_by_company_id, proposed_by,
    ownership_percentage, ownership_type
  )
  values (
    p_group_id, p_child_company_id, p_co_parent_company_id,
    p_as_company_id, auth.uid(),
    p_ownership_percentage, p_ownership_type
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.propose_co_ownership(uuid, uuid, uuid, uuid, numeric, text) from public;
grant execute on function public.propose_co_ownership(uuid, uuid, uuid, uuid, numeric, text) to authenticated;

-- ---------------------------------------------------------------------------
-- get_pending_co_owner_proposals — now also returns percentage + type
-- ---------------------------------------------------------------------------

drop function if exists public.get_pending_co_owner_proposals(uuid);

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
  ownership_percentage numeric,
  ownership_type text,
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
    co.proposed_by_company_id,
    co.ownership_percentage, co.ownership_type,
    co.created_at
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
