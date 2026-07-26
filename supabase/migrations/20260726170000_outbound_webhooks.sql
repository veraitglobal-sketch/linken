-- Outbound webhooks: endpoints + delivery log. Pro / Agent surface.
-- Signing secret is stored for HMAC (owner/service-role only).

create table public.webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  url text not null,
  description text not null default '',
  secret text not null,
  events text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint webhook_endpoints_url_https check (
    url ~* '^https://'
    or url ~* '^http://(localhost|127\.0\.0\.1)(:[0-9]+)?(/|$)'
  ),
  constraint webhook_endpoints_events_valid check (
    events <> '{}'
    and events <@ array[
      'inquiry.created',
      'partnership.accepted',
      'reference.confirmed',
      'booking.connected'
    ]::text[]
  ),
  constraint webhook_endpoints_secret_len check (char_length(secret) >= 24)
);

create index webhook_endpoints_company_idx
  on public.webhook_endpoints (company_id)
  where active = true;

create table public.webhook_deliveries (
  id bigint generated always as identity primary key,
  endpoint_id uuid not null references public.webhook_endpoints (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  event_type text not null,
  event_id text not null,
  payload jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'success', 'failed')),
  attempt_count int not null default 0,
  next_attempt_at timestamptz,
  last_status_code int,
  last_error text not null default '',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint webhook_deliveries_event_unique unique (endpoint_id, event_id)
);

create index webhook_deliveries_pending_idx
  on public.webhook_deliveries (next_attempt_at)
  where status = 'pending';

create index webhook_deliveries_company_idx
  on public.webhook_deliveries (company_id, created_at desc);

alter table public.webhook_endpoints enable row level security;
alter table public.webhook_deliveries enable row level security;

create policy "webhook_endpoints_owner_select"
on public.webhook_endpoints for select
to authenticated
using (public.is_company_owner(company_id));

create policy "webhook_endpoints_owner_insert"
on public.webhook_endpoints for insert
to authenticated
with check (public.is_company_owner(company_id));

create policy "webhook_endpoints_owner_update"
on public.webhook_endpoints for update
to authenticated
using (public.is_company_owner(company_id))
with check (public.is_company_owner(company_id));

create policy "webhook_endpoints_owner_delete"
on public.webhook_endpoints for delete
to authenticated
using (public.is_company_owner(company_id));

create policy "webhook_deliveries_owner_select"
on public.webhook_deliveries for select
to authenticated
using (public.is_company_owner(company_id));

revoke all on table public.webhook_endpoints from public, anon, authenticated;
grant select (
  id, company_id, url, description, events, active, created_at, updated_at
) on public.webhook_endpoints to authenticated;
-- secret never granted to authenticated — returned once at create via RPC/action using service role or column privilege for owner insert only
grant insert (
  company_id, url, description, secret, events, active
) on public.webhook_endpoints to authenticated;
grant update (
  url, description, events, active, updated_at
) on public.webhook_endpoints to authenticated;
grant delete on public.webhook_endpoints to authenticated;

revoke all on table public.webhook_deliveries from public, anon, authenticated;
grant select (
  id, endpoint_id, company_id, event_type, event_id, payload, status,
  attempt_count, next_attempt_at, last_status_code, last_error,
  created_at, completed_at
) on public.webhook_deliveries to authenticated;

-- Agent API scope for webhook CRUD
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
      'verification:run',
      'webhooks:manage'
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
    'verification:run',
    'webhooks:manage'
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
