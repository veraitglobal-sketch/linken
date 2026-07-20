-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260720155440
-- name: member_section_permissions_3
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

-- create_team_invitation with permissions + operator access.
drop function if exists public.create_team_invitation(uuid, text, text, text, text);

create or replace function public.create_team_invitation(
  p_company_id uuid,
  p_invite_name text,
  p_invite_title text,
  p_invite_email text,
  p_role text default 'member',
  p_permissions text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending int;
  v_token uuid;
  v_email text := lower(trim(p_invite_email));
  v_name text := trim(p_invite_name);
  v_title text := coalesce(trim(p_invite_title), '');
  v_role text := lower(trim(coalesce(p_role, 'member')));
  v_perms text[] := '{}';
  v_existing_user uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if not (
    public.is_company_member(p_company_id, 'admin')
    or public.is_company_operator(p_company_id)
  ) then
    raise exception 'Only owner, admin, or branch operator can invite';
  end if;
  if v_name = '' or v_email = '' then
    raise exception 'Name and email are required';
  end if;
  if v_role not in ('admin', 'member') then
    raise exception 'Role must be admin or member';
  end if;

  if v_role = 'member' then
    v_perms := public.normalize_section_permissions(p_permissions);
  else
    v_perms := '{}';
  end if;

  select count(*)::int into v_pending
  from public.team_invitations
  where company_id = p_company_id
    and status = 'pending';

  if v_pending >= 20 then
    raise exception 'Max 20 pending invites per company';
  end if;

  v_existing_user := public.lookup_user_id_by_email(v_email);
  if v_existing_user is not null and exists (
    select 1
    from public.company_members m
    where m.company_id = p_company_id
      and m.user_id = v_existing_user
  ) then
    raise exception 'Already a member';
  end if;

  if exists (
    select 1
    from public.team_invitations
    where company_id = p_company_id
      and lower(invite_email) = v_email
      and status = 'pending'
  ) then
    raise exception 'Invite already pending for this email';
  end if;

  insert into public.team_invitations (
    company_id,
    invited_by,
    invite_name,
    invite_title,
    invite_email,
    role,
    permissions
  )
  values (
    p_company_id,
    auth.uid(),
    v_name,
    v_title,
    v_email,
    v_role,
    v_perms
  )
  returning token into v_token;

  return v_token;
end;
$$;

revoke all on function public.create_team_invitation(uuid, text, text, text, text, text[]) from public;
grant execute on function public.create_team_invitation(uuid, text, text, text, text, text[]) to authenticated;

-- Backward-compatible 5-arg overload.
create or replace function public.create_team_invitation(
  p_company_id uuid,
  p_invite_name text,
  p_invite_title text,
  p_invite_email text,
  p_role text default 'member'
)
returns uuid
language sql
security definer
set search_path = public
as $$
  select public.create_team_invitation(
    p_company_id,
    p_invite_name,
    p_invite_title,
    p_invite_email,
    p_role,
    '{}'::text[]
  );
$$;

revoke all on function public.create_team_invitation(uuid, text, text, text, text) from public;
grant execute on function public.create_team_invitation(uuid, text, text, text, text) to authenticated;
