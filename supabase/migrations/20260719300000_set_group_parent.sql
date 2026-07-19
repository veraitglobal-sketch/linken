-- Immediate reparent for graph editor (group creator / owners of both firms)

create or replace function public.set_group_parent(
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
  v_allowed boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select created_by into v_creator
  from public.company_groups where id = p_group_id;

  if v_creator is null then
    raise exception 'Group not found';
  end if;

  -- Group creator can rearrange the tree freely
  if v_creator = auth.uid() then
    v_allowed := true;
  end if;

  -- Owner of the child can move it
  if public.is_company_owner(p_company_id) then
    v_allowed := true;
  end if;

  -- Owner of the new parent can attach (incl. unclaimed subsidiaries they control via group)
  if p_parent_company_id is not null
     and public.is_company_owner(p_parent_company_id) then
    v_allowed := true;
  end if;

  if not v_allowed then
    raise exception 'Not allowed to set parent';
  end if;

  if p_parent_company_id is not null then
    perform public.validate_group_parent(
      p_group_id, p_company_id, p_parent_company_id
    );
  end if;

  update public.company_group_members
  set
    parent_company_id = p_parent_company_id,
    pending_parent_company_id = null
  where group_id = p_group_id
    and company_id = p_company_id
    and status = 'confirmed'
  returning * into v_row;

  if v_row.company_id is null then
    raise exception 'Company is not a confirmed member of this group';
  end if;

  return v_row;
end;
$$;

revoke all on function public.set_group_parent(uuid, uuid, uuid) from public;
grant execute on function public.set_group_parent(uuid, uuid, uuid) to authenticated;
