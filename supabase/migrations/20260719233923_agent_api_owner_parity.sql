-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260719233923
-- name: agent_api_owner_parity
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

alter table public.api_keys
  drop constraint if exists api_keys_scopes_valid;

alter table public.api_keys
  add constraint api_keys_scopes_valid check (
    scopes <@ array[
      'read',
      'content:write',
      'invites:send',
      'team:manage',
      'structure:manage',
      'settings:write',
      'inquiries:manage',
      'verification:run'
    ]::text[]
  );

create or replace function public.create_api_key(
  p_company_id uuid,
  p_name text,
  p_scopes text[],
  p_key_hash text,
  p_key_prefix text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_name text := trim(p_name);
  v_scopes text[] := coalesce(p_scopes, '{}');
  v_allowed text[] := array[
    'read',
    'content:write',
    'invites:send',
    'team:manage',
    'structure:manage',
    'settings:write',
    'inquiries:manage',
    'verification:run'
  ];
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_company_owner(p_company_id) then
    raise exception 'Only the company owner can create API keys';
  end if;
  if v_name = '' then
    raise exception 'Name is required';
  end if;
  if length(v_name) > 80 then
    raise exception 'Name is too long';
  end if;
  if p_key_hash is null or length(p_key_hash) < 32 then
    raise exception 'Invalid key hash';
  end if;
  if p_key_prefix is null or length(p_key_prefix) < 4 then
    raise exception 'Invalid key prefix';
  end if;
  if not (v_scopes <@ v_allowed) then
    raise exception 'Invalid scopes';
  end if;
  if cardinality(v_scopes) = 0 then
    raise exception 'At least one scope is required';
  end if;

  insert into public.api_keys (
    company_id, name, key_prefix, key_hash, scopes, created_by
  )
  values (
    p_company_id, v_name, p_key_prefix, p_key_hash, v_scopes, auth.uid()
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.agent_record_verification_attempt(p_company_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz;
  v_count int;
begin
  insert into public.company_verifications (company_id)
  values (p_company_id)
  on conflict (company_id) do nothing;

  select check_window_start, check_count
  into v_start, v_count
  from public.company_verifications
  where company_id = p_company_id
  for update;

  if v_start is null or v_start < now() - interval '1 hour' then
    update public.company_verifications
    set check_window_start = now(),
        check_count = 1,
        last_verification_check = now()
    where company_id = p_company_id;
    return true;
  end if;

  if v_count >= 5 then
    update public.company_verifications
    set last_verification_check = now()
    where company_id = p_company_id;
    return false;
  end if;

  update public.company_verifications
  set check_count = v_count + 1,
      last_verification_check = now()
  where company_id = p_company_id;
  return true;
end;
$$;

create or replace function public.agent_record_logo_refresh_attempt(p_company_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz;
  v_count int;
begin
  select logo_refresh_window_start, logo_refresh_count
  into v_start, v_count
  from public.companies
  where id = p_company_id
  for update;

  if not found then
    raise exception 'Company not found';
  end if;

  if v_start is null or v_start < date_trunc('day', now()) then
    update public.companies
    set logo_refresh_window_start = now(),
        logo_refresh_count = 1
    where id = p_company_id;
    return true;
  end if;

  if v_count >= 3 then
    return false;
  end if;

  update public.companies
  set logo_refresh_count = logo_refresh_count + 1
  where id = p_company_id;
  return true;
end;
$$;

create or replace function public.agent_create_team_invitation(
  p_company_id uuid,
  p_invited_by uuid,
  p_invite_name text,
  p_invite_title text,
  p_invite_email text,
  p_role text default 'member'
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
  v_existing_user uuid;
  v_owner uuid;
begin
  select owner_id into v_owner
  from public.companies
  where id = p_company_id and claimed = true;

  if v_owner is null or v_owner <> p_invited_by then
    raise exception 'Only the company owner can invite via Agent API';
  end if;

  if v_name = '' or v_email = '' then
    raise exception 'Name and email are required';
  end if;
  if v_role not in ('admin', 'member') then
    raise exception 'Role must be admin or member';
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
    role
  )
  values (
    p_company_id,
    p_invited_by,
    v_name,
    v_title,
    v_email,
    v_role
  )
  returning token into v_token;

  return v_token;
end;
$$;

revoke all on function public.agent_record_verification_attempt(uuid) from public;
revoke all on function public.agent_record_logo_refresh_attempt(uuid) from public;
revoke all on function public.agent_create_team_invitation(uuid, uuid, text, text, text, text) from public;

grant execute on function public.agent_record_verification_attempt(uuid) to service_role;
grant execute on function public.agent_record_logo_refresh_attempt(uuid) to service_role;
grant execute on function public.agent_create_team_invitation(uuid, uuid, text, text, text, text) to service_role;
