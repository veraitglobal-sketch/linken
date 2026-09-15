-- MCP connector OAuth 2.1 (dynamic client registration + PKCE).
-- Tokens issued after consent are normal api_keys rows (hs_…).
-- No public grants. RPCs are service_role only.

create table public.oauth_clients (
  client_id text primary key,
  client_name text not null default 'MCP client',
  redirect_uris text[] not null,
  created_at timestamptz not null default now()
);

create table public.oauth_authorization_codes (
  code_hash text primary key,
  client_id text not null references public.oauth_clients(client_id) on delete cascade,
  user_id uuid not null,
  company_id uuid not null references public.companies(id) on delete cascade,
  redirect_uri text not null,
  code_challenge text not null,
  scope text not null default 'mcp',
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.oauth_clients enable row level security;
alter table public.oauth_authorization_codes enable row level security;

revoke all on public.oauth_clients from anon, authenticated;
revoke all on public.oauth_authorization_codes from anon, authenticated;

create or replace function public.oauth_register_client(
  p_client_id text,
  p_client_name text,
  p_redirect_uris text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_client_id is null or length(p_client_id) < 8 then
    raise exception 'Invalid client_id';
  end if;
  if p_redirect_uris is null or cardinality(p_redirect_uris) < 1 then
    raise exception 'redirect_uris required';
  end if;
  insert into public.oauth_clients (client_id, client_name, redirect_uris)
  values (
    p_client_id,
    coalesce(nullif(trim(p_client_name), ''), 'MCP client'),
    p_redirect_uris
  );
end;
$$;

create or replace function public.oauth_create_code(
  p_code_hash text,
  p_client_id text,
  p_user_id uuid,
  p_company_id uuid,
  p_redirect_uri text,
  p_code_challenge text,
  p_scope text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.oauth_clients where client_id = p_client_id
  ) then
    raise exception 'Unknown client';
  end if;
  if p_code_hash is null or length(p_code_hash) < 32 then
    raise exception 'Invalid code hash';
  end if;
  insert into public.oauth_authorization_codes (
    code_hash, client_id, user_id, company_id, redirect_uri,
    code_challenge, scope, expires_at
  )
  values (
    p_code_hash, p_client_id, p_user_id, p_company_id, p_redirect_uri,
    p_code_challenge, coalesce(nullif(trim(p_scope), ''), 'mcp'),
    now() + interval '10 minutes'
  );
end;
$$;

create or replace function public.oauth_consume_code(
  p_code_hash text,
  p_client_id text,
  p_redirect_uri text
)
returns table (
  user_id uuid,
  company_id uuid,
  code_challenge text,
  scope text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.oauth_authorization_codes c
  set used_at = now()
  where c.code_hash = p_code_hash
    and c.used_at is null
    and c.expires_at > now()
    and c.client_id = p_client_id
    and c.redirect_uri = p_redirect_uri
  returning c.user_id, c.company_id, c.code_challenge, c.scope;

  if not found then
    raise exception 'Invalid or expired code';
  end if;
end;
$$;

create or replace function public.oauth_issue_api_key(
  p_company_id uuid,
  p_user_id uuid,
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
    'verification:run',
    'webhooks:manage'
  ];
begin
  if p_user_id is null then
    raise exception 'Not authenticated';
  end if;
  if not exists (
    select 1 from public.company_members m
    where m.company_id = p_company_id
      and m.user_id = p_user_id
      and m.role in ('owner', 'admin')
  ) then
    raise exception 'Only an owner or admin can issue a connector key';
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
    p_company_id, v_name, p_key_prefix, p_key_hash, v_scopes, p_user_id
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.oauth_register_client(text, text, text[]) from public;
revoke all on function public.oauth_create_code(text, text, uuid, uuid, text, text, text) from public;
revoke all on function public.oauth_consume_code(text, text, text) from public;
revoke all on function public.oauth_issue_api_key(uuid, uuid, text, text[], text, text) from public;

grant execute on function public.oauth_register_client(text, text, text[]) to service_role;
grant execute on function public.oauth_create_code(text, text, uuid, uuid, text, text, text) to service_role;
grant execute on function public.oauth_consume_code(text, text, text) to service_role;
grant execute on function public.oauth_issue_api_key(uuid, uuid, text, text[], text, text) to service_role;
