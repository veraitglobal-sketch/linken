-- Service references (ongoing client relationships) + confirm flow

create table public.service_references (
  id uuid primary key default gen_random_uuid(),
  provider_company_id uuid not null references public.companies (id) on delete cascade,
  client_company_id uuid references public.companies (id) on delete set null,
  client_name text not null,
  service text not null,
  started_year text not null default '',
  ongoing boolean not null default true,
  ended_year text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined')),
  confirm_token uuid unique default gen_random_uuid(),
  invite_email text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index service_references_provider_idx
  on public.service_references (provider_company_id);
create index service_references_client_idx
  on public.service_references (client_company_id);
create index service_references_status_idx
  on public.service_references (status);
create unique index service_references_token_uidx
  on public.service_references (confirm_token)
  where confirm_token is not null;

alter table public.service_references enable row level security;

-- Public: confirmed + pending (awaiting shown neutrally). Declined only for parties.
create policy "service_references_public_read"
on public.service_references for select
using (
  status in ('confirmed', 'pending')
  or public.is_company_owner(provider_company_id)
  or (
    client_company_id is not null
    and public.is_company_owner(client_company_id)
  )
);

create policy "service_references_provider_insert"
on public.service_references for insert
to authenticated
with check (public.is_company_owner(provider_company_id));

create policy "service_references_provider_delete"
on public.service_references for delete
to authenticated
using (public.is_company_owner(provider_company_id));

-- Provider may edit only while pending — otherwise it could flip its own
-- status to 'confirmed' (RLS cannot restrict columns) or silently rewrite
-- service/years after the client confirmed. Status changes go exclusively
-- through confirm_service_reference below.
create policy "service_references_provider_update_pending"
on public.service_references for update
to authenticated
using (
  status = 'pending'
  and public.is_company_owner(provider_company_id)
)
with check (
  status = 'pending'
  and public.is_company_owner(provider_company_id)
);

-- confirm_token is a bearer credential and invite_email is private; pending
-- rows are publicly readable, so these columns must not be exposed through
-- the table API. Token-gated access goes through the preview function only.
revoke select on public.service_references from anon, authenticated;
grant select (
  id, provider_company_id, client_company_id, client_name, service,
  started_year, ongoing, ended_year, status, created_at, confirmed_at
) on public.service_references to anon, authenticated;

-- Preview for confirm page (no raw email spray beyond invite context)
create or replace function public.get_service_reference_preview(p_token uuid)
returns table (
  id uuid,
  status text,
  service text,
  started_year text,
  ongoing boolean,
  ended_year text,
  client_name text,
  invite_email text,
  provider_id uuid,
  provider_name text,
  provider_slug text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.status,
    r.service,
    r.started_year,
    r.ongoing,
    r.ended_year,
    r.client_name,
    r.invite_email,
    p.id,
    p.name,
    p.slug
  from public.service_references r
  join public.companies p on p.id = r.provider_company_id
  where r.confirm_token = p_token;
$$;

revoke all on function public.get_service_reference_preview(uuid) from public;
grant execute on function public.get_service_reference_preview(uuid) to anon, authenticated;

-- Confirm / decline — only claimed company owners; sets client_company_id
create or replace function public.confirm_service_reference(
  p_token uuid,
  p_decision text,
  p_company_id uuid
)
returns public.service_references
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.service_references;
begin
  if p_decision not in ('confirmed', 'declined') then
    raise exception 'Invalid decision';
  end if;

  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_company_owner(p_company_id) then
    raise exception 'Not company owner';
  end if;

  update public.service_references r
  set
    status = p_decision,
    confirmed_at = case when p_decision = 'confirmed' then now() else null end,
    client_company_id = case when p_decision = 'confirmed' then p_company_id else r.client_company_id end,
    confirm_token = null
  where r.confirm_token = p_token
    and r.status = 'pending'
    -- a company must not confirm its own reference
    and r.provider_company_id <> p_company_id
  returning * into row;

  if row.id is null then
    raise exception 'Request not found or already resolved';
  end if;

  return row;
end;
$$;

revoke all on function public.confirm_service_reference(uuid, text, uuid) from public;
grant execute on function public.confirm_service_reference(uuid, text, uuid) to authenticated;
