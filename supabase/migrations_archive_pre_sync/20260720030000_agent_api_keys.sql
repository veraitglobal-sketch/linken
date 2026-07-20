-- Agent API v1 — hashed API keys + audit log.
-- Keys belong to a company. Confirm/accept/claim paths are NEVER exposed via API.

create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  scopes text[] not null default '{}',
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  constraint api_keys_scopes_valid check (
    scopes <@ array['read', 'content:write', 'invites:send']::text[]
  )
);

create index api_keys_company_idx on public.api_keys (company_id);
create index api_keys_hash_idx on public.api_keys (key_hash)
  where revoked_at is null;

create table public.api_audit_log (
  id bigint generated always as identity primary key,
  api_key_id uuid references public.api_keys (id) on delete set null,
  company_id uuid not null references public.companies (id) on delete cascade,
  method text not null,
  path text not null,
  action text not null,
  status int not null,
  summary text not null default '',
  created_at timestamptz not null default now()
);

create index api_audit_company_idx
  on public.api_audit_log (company_id, created_at desc);

alter table public.api_keys enable row level security;
alter table public.api_audit_log enable row level security;

-- Owners may read their keys and audit trail. All writes go through
-- security definer RPCs or the service-role Agent API layer.
create policy "api_keys_owner_select"
on public.api_keys for select
to authenticated
using (public.is_company_owner(company_id));

create policy "api_audit_owner_select"
on public.api_audit_log for select
to authenticated
using (public.is_company_owner(company_id));

revoke all on table public.api_keys from public, anon, authenticated;
grant select (
  id, company_id, name, key_prefix, scopes, created_by,
  created_at, last_used_at, revoked_at
) on public.api_keys to authenticated;

revoke all on table public.api_audit_log from public, anon, authenticated;
grant select (
  id, api_key_id, company_id, method, path, action, status, summary, created_at
) on public.api_audit_log to authenticated;

-- Create key metadata (plaintext is generated in the app, never stored).
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
  if not (v_scopes <@ array['read', 'content:write', 'invites:send']::text[]) then
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

create or replace function public.revoke_api_key(p_key_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select company_id into v_company
  from public.api_keys
  where id = p_key_id;

  if v_company is null then
    raise exception 'API key not found';
  end if;
  if not public.is_company_owner(v_company) then
    raise exception 'Only the company owner can revoke API keys';
  end if;

  update public.api_keys
  set revoked_at = coalesce(revoked_at, now())
  where id = p_key_id;
end;
$$;

revoke all on function public.create_api_key(uuid, text, text[], text, text) from public;
revoke all on function public.revoke_api_key(uuid) from public;
grant execute on function public.create_api_key(uuid, text, text[], text, text) to authenticated;
grant execute on function public.revoke_api_key(uuid) to authenticated;
