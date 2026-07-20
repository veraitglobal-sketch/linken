-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260720155444
-- name: member_section_permissions_4
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

-- Accept invite copies permissions onto membership.
create or replace function public.respond_team_invitation(
  p_token uuid,
  p_decision text,
  p_public_visible boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv public.team_invitations%rowtype;
  v_decision text := lower(trim(p_decision));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if v_decision not in ('accepted', 'declined') then
    raise exception 'Invalid decision';
  end if;

  select * into v_inv
  from public.team_invitations
  where token = p_token
  for update;

  if not found then
    raise exception 'Invite not found';
  end if;
  if v_inv.status <> 'pending' then
    raise exception 'Invite already closed';
  end if;

  if v_decision = 'declined' then
    update public.team_invitations
    set status = 'declined',
        resolved_at = now()
    where id = v_inv.id;
    return;
  end if;

  if exists (
    select 1
    from public.company_members
    where company_id = v_inv.company_id
      and user_id = auth.uid()
  ) then
    raise exception 'Already a member';
  end if;

  insert into public.company_members (
    company_id,
    user_id,
    role,
    display_name,
    display_title,
    public_visible,
    permissions
  )
  values (
    v_inv.company_id,
    auth.uid(),
    v_inv.role,
    v_inv.invite_name,
    v_inv.invite_title,
    coalesce(p_public_visible, false),
    case
      when v_inv.role = 'member' then coalesce(v_inv.permissions, '{}')
      else '{}'::text[]
    end
  );

  update public.team_invitations
  set status = 'accepted',
      resolved_at = now()
  where id = v_inv.id;
end;
$$;

-- Update member permissions RPC (cleaner than direct table update conflicts).
create or replace function public.set_member_section_permissions(
  p_company_id uuid,
  p_user_id uuid,
  p_permissions text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_perms text[] := public.normalize_section_permissions(p_permissions);
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if not (
    public.is_company_member(p_company_id, 'admin')
    or public.is_company_operator(p_company_id)
  ) then
    raise exception 'Not allowed';
  end if;

  update public.company_members
  set permissions = v_perms
  where company_id = p_company_id
    and user_id = p_user_id
    and role = 'member';

  if not found then
    raise exception 'Member not found';
  end if;
end;
$$;

revoke all on function public.set_member_section_permissions(uuid, uuid, text[]) from public;
grant execute on function public.set_member_section_permissions(uuid, uuid, text[]) to authenticated;
