-- Part B: granular section permissions for company_members role = member.

create or replace function public.is_valid_workspace_section(p_section text)
returns boolean
language sql
immutable
as $$
  select lower(trim(p_section)) in (
    'network',
    'structure',
    'partners',
    'team',
    'verification',
    'widgets',
    'api',
    'insights',
    'inbox',
    'radar',
    'settings'
  );
$$;

create or replace function public.normalize_section_permissions(p_permissions text[])
returns text[]
language plpgsql
immutable
as $$
declare
  v_out text[] := '{}';
  v_item text;
  v_norm text;
begin
  if p_permissions is null then
    return '{}';
  end if;
  foreach v_item in array p_permissions loop
    v_norm := lower(trim(v_item));
    if public.is_valid_workspace_section(v_norm)
       and not (v_norm = any (v_out))
    then
      v_out := array_append(v_out, v_norm);
    end if;
  end loop;
  return v_out;
end;
$$;

alter table public.company_members
  add column if not exists permissions text[] not null default '{}';

alter table public.company_members
  drop constraint if exists company_members_permissions_valid;

alter table public.company_members
  add constraint company_members_permissions_valid
  check (
    permissions <@ array[
      'network',
      'structure',
      'partners',
      'team',
      'verification',
      'widgets',
      'api',
      'insights',
      'inbox',
      'radar',
      'settings'
    ]::text[]
  );

comment on column public.company_members.permissions is
  'Section keys for role=member only. Ignored for owner/admin (full access).';

alter table public.team_invitations
  add column if not exists permissions text[] not null default '{}';

alter table public.team_invitations
  drop constraint if exists team_invitations_permissions_valid;

alter table public.team_invitations
  add constraint team_invitations_permissions_valid
  check (
    permissions <@ array[
      'network',
      'structure',
      'partners',
      'team',
      'verification',
      'widgets',
      'api',
      'insights',
      'inbox',
      'radar',
      'settings'
    ]::text[]
  );

-- Expose permissions on select grants.
grant select (
  id,
  company_id,
  invited_by,
  invite_name,
  invite_title,
  invite_email,
  role,
  permissions,
  status,
  created_at,
  resolved_at
) on public.team_invitations to authenticated;

grant select on public.company_members to authenticated;

-- has_section_access: owner/admin always; member if section listed.
create or replace function public.has_section_access(
  p_company_id uuid,
  p_section text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when not public.is_valid_workspace_section(p_section) then false
      when public.is_company_member(p_company_id, 'admin') then true
      when public.is_company_operator(p_company_id) then true
      else exists (
        select 1
        from public.company_members m
        where m.company_id = p_company_id
          and m.user_id = auth.uid()
          and m.role = 'member'
          and lower(trim(p_section)) = any (m.permissions)
      )
    end;
$$;

revoke all on function public.has_section_access(uuid, text) from public;
grant execute on function public.has_section_access(uuid, text) to authenticated;

-- Admin/operator may update member permissions (not role/owner rows via this grant).
drop policy if exists "company_members_admin_update_permissions" on public.company_members;
create policy "company_members_admin_update_permissions"
on public.company_members for update
to authenticated
using (
  role = 'member'
  and (
    public.is_company_member(company_id, 'admin')
    or public.is_company_operator(company_id)
  )
)
with check (
  role = 'member'
  and (
    public.is_company_member(company_id, 'admin')
    or public.is_company_operator(company_id)
  )
);

grant update (permissions) on public.company_members to authenticated;

-- Members must not self-escalate section permissions.
create or replace function public.company_members_protect_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.permissions is distinct from new.permissions then
    if not (
      public.is_company_member(old.company_id, 'admin')
      or public.is_company_operator(old.company_id)
    ) then
      raise exception 'Only owner or admin can change section permissions.';
    end if;
    if new.role <> 'member' then
      new.permissions := '{}';
    else
      new.permissions := public.normalize_section_permissions(new.permissions);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists company_members_protect_permissions on public.company_members;
create trigger company_members_protect_permissions
  before update on public.company_members
  for each row
  execute function public.company_members_protect_permissions();

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
