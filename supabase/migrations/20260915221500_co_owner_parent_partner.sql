-- Joint firms are created under the primary parent. The other owner is
-- already a confirmed partner of that parent, not of the new child.

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

  select status, parent_company_id into v_child_status, v_primary_parent
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
        or (
          v_primary_parent is not null
          and (
            (requester_id = v_primary_parent and recipient_id = p_co_parent_company_id)
            or (requester_id = p_co_parent_company_id and recipient_id = v_primary_parent)
          )
        )
      )
  ) into v_co_parent_is_partner;

  if not v_co_parent_is_member and not v_co_parent_is_partner then
    raise exception 'Proposed co-owner must be a confirmed group member or a confirmed partner';
  end if;

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
