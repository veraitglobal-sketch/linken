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
  v_child_claimed boolean;
  v_parent_owner boolean := false;
  v_direct boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select created_by into v_creator
  from public.company_groups where id = p_group_id;

  if v_creator is null then
    raise exception 'Group not found';
  end if;

  select c.claimed into v_child_claimed
  from public.companies c where c.id = p_company_id;

  v_parent_owner := p_parent_company_id is not null
    and public.is_company_owner(p_parent_company_id);

  -- Direct set: group creator, owner of the child itself, or parent owner
  -- attaching an UNCLAIMED child (no owner exists to consent).
  if v_creator = auth.uid()
     or public.is_company_owner(p_company_id)
     or (v_parent_owner and v_child_claimed is not true) then
    v_direct := true;
  end if;

  if not v_direct and not v_parent_owner then
    raise exception 'Not allowed to set parent';
  end if;

  if p_parent_company_id is not null then
    perform public.validate_group_parent(
      p_group_id, p_company_id, p_parent_company_id
    );
  end if;

  if v_direct then
    update public.company_group_members
    set
      parent_company_id = p_parent_company_id,
      pending_parent_company_id = null
    where group_id = p_group_id
      and company_id = p_company_id
      and status = 'confirmed'
    returning * into v_row;
  else
    -- Claimed child, parent owner asking: "owned by X" is a public claim the
    -- child's owner must confirm — record a proposal for respond_group_parent,
    -- never attach unilaterally.
    update public.company_group_members
    set pending_parent_company_id = p_parent_company_id
    where group_id = p_group_id
      and company_id = p_company_id
      and status = 'confirmed'
    returning * into v_row;
  end if;

  if v_row.company_id is null then
    raise exception 'Company is not a confirmed member of this group';
  end if;

  return v_row;
end;
$$;

revoke all on function public.set_group_parent(uuid, uuid, uuid) from public;
grant execute on function public.set_group_parent(uuid, uuid, uuid) to authenticated;
