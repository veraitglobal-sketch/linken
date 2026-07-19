-- Case studies + client confirmation (third trust layer)

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  slug text not null,
  summary text not null default '',
  challenge text not null default '',
  outcome text not null default '',
  location text not null default '',
  year text not null default '',
  services text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint case_studies_company_slug unique (company_id, slug)
);

create table public.case_study_partners (
  case_study_id uuid not null references public.case_studies (id) on delete cascade,
  partner_company_id uuid not null references public.companies (id) on delete cascade,
  role text not null default '',
  confirmed boolean not null default false,
  confirmed_at timestamptz,
  primary key (case_study_id, partner_company_id)
);

create table public.case_study_client_confirmation_requests (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references public.case_studies (id) on delete cascade,
  requested_by_company_id uuid not null references public.companies (id) on delete cascade,
  email text not null,
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined')),
  confirmed_by_company_id uuid references public.companies (id) on delete set null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index case_studies_company_idx on public.case_studies (company_id);
create index case_study_partners_partner_idx on public.case_study_partners (partner_company_id);
create index client_confirm_case_idx on public.case_study_client_confirmation_requests (case_study_id);
create index client_confirm_token_idx on public.case_study_client_confirmation_requests (token);
create index client_confirm_status_idx on public.case_study_client_confirmation_requests (status);

alter table public.case_studies enable row level security;
alter table public.case_study_partners enable row level security;
alter table public.case_study_client_confirmation_requests enable row level security;

-- Case studies: public read, owner write
create policy "case_studies_public_read"
on public.case_studies for select
using (true);

create policy "case_studies_owner_insert"
on public.case_studies for insert
to authenticated
with check (public.is_company_owner(company_id));

create policy "case_studies_owner_update"
on public.case_studies for update
to authenticated
using (public.is_company_owner(company_id))
with check (public.is_company_owner(company_id));

create policy "case_studies_owner_delete"
on public.case_studies for delete
to authenticated
using (public.is_company_owner(company_id));

-- Partners on case studies
create policy "case_study_partners_public_read"
on public.case_study_partners for select
using (true);

-- Owner can add/edit/remove partner rows, but NEVER set confirmed: only the
-- tagged partner company can confirm its own row (sacred confirmation rule).
create policy "case_study_partners_owner_insert"
on public.case_study_partners for insert
to authenticated
with check (
  confirmed = false
  and confirmed_at is null
  and exists (
    select 1 from public.case_studies cs
    where cs.id = case_study_id
      and public.is_company_owner(cs.company_id)
  )
);

create policy "case_study_partners_owner_update_unconfirmed"
on public.case_study_partners for update
to authenticated
using (
  confirmed = false
  and exists (
    select 1 from public.case_studies cs
    where cs.id = case_study_id
      and public.is_company_owner(cs.company_id)
  )
)
with check (
  confirmed = false
  and confirmed_at is null
  and exists (
    select 1 from public.case_studies cs
    where cs.id = case_study_id
      and public.is_company_owner(cs.company_id)
  )
);

create policy "case_study_partners_owner_delete"
on public.case_study_partners for delete
to authenticated
using (
  exists (
    select 1 from public.case_studies cs
    where cs.id = case_study_id
      and public.is_company_owner(cs.company_id)
  )
);

create policy "case_study_partners_partner_confirm"
on public.case_study_partners for update
to authenticated
using (public.is_company_owner(partner_company_id))
with check (public.is_company_owner(partner_company_id));

-- Client confirmation requests
create policy "client_confirm_public_read_confirmed"
on public.case_study_client_confirmation_requests for select
using (
  status = 'confirmed'
  or public.is_company_owner(requested_by_company_id)
  or (
    confirmed_by_company_id is not null
    and public.is_company_owner(confirmed_by_company_id)
  )
);

create policy "client_confirm_owner_insert"
on public.case_study_client_confirmation_requests for insert
to authenticated
with check (
  public.is_company_owner(requested_by_company_id)
  and exists (
    select 1 from public.case_studies cs
    where cs.id = case_study_id
      and cs.company_id = requested_by_company_id
      and public.is_company_owner(cs.company_id)
  )
);

-- No direct UPDATE for anyone: the requester must not be able to set
-- status='confirmed' on its own request. The only path that changes status is
-- the security definer function respond_client_confirmation below.
-- Requester may withdraw a pending request.
create policy "client_confirm_requester_delete_pending"
on public.case_study_client_confirmation_requests for delete
to authenticated
using (
  status = 'pending'
  and public.is_company_owner(requested_by_company_id)
);

-- The token is a bearer credential and the email is private: never readable
-- through the table API (RLS protects rows, not columns). Token-gated access
-- goes through get_client_confirmation_by_token only.
revoke select on public.case_study_client_confirmation_requests from anon, authenticated;
grant select (
  id, case_study_id, requested_by_company_id, status,
  confirmed_by_company_id, created_at, confirmed_at
) on public.case_study_client_confirmation_requests to anon, authenticated;

-- Token lookup (confirm page) — security definer, no email leak of other rows
create or replace function public.get_client_confirmation_by_token(p_token uuid)
returns table (
  id uuid,
  case_study_id uuid,
  requested_by_company_id uuid,
  email text,
  token uuid,
  status text,
  confirmed_by_company_id uuid,
  created_at timestamptz,
  confirmed_at timestamptz,
  case_title text,
  case_slug text,
  case_summary text,
  case_year text,
  case_location text,
  requester_name text,
  requester_slug text,
  confirmer_name text,
  confirmer_slug text,
  confirmer_logo_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.case_study_id,
    r.requested_by_company_id,
    r.email,
    r.token,
    r.status,
    r.confirmed_by_company_id,
    r.created_at,
    r.confirmed_at,
    cs.title,
    cs.slug,
    cs.summary,
    cs.year,
    cs.location,
    req.name,
    req.slug,
    conf.name,
    conf.slug,
    conf.logo_url
  from public.case_study_client_confirmation_requests r
  join public.case_studies cs on cs.id = r.case_study_id
  join public.companies req on req.id = r.requested_by_company_id
  left join public.companies conf on conf.id = r.confirmed_by_company_id
  where r.token = p_token;
$$;

revoke all on function public.get_client_confirmation_by_token(uuid) from public;
grant execute on function public.get_client_confirmation_by_token(uuid) to anon, authenticated;

-- Confirm / decline by token (caller must own confirmer company)
create or replace function public.respond_client_confirmation(
  p_token uuid,
  p_response text,
  p_company_id uuid
)
returns public.case_study_client_confirmation_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.case_study_client_confirmation_requests;
begin
  if p_response not in ('confirmed', 'declined') then
    raise exception 'Invalid response';
  end if;

  if not public.is_company_owner(p_company_id) then
    raise exception 'Not company owner';
  end if;

  update public.case_study_client_confirmation_requests r
  set
    status = p_response,
    confirmed_by_company_id = case when p_response = 'confirmed' then p_company_id else null end,
    confirmed_at = case when p_response = 'confirmed' then now() else null end
  where r.token = p_token
    and r.status = 'pending'
    -- a company must not confirm its own request
    and r.requested_by_company_id <> p_company_id
  returning * into row;

  if row.id is null then
    raise exception 'Request not found or already resolved';
  end if;

  return row;
end;
$$;

revoke all on function public.respond_client_confirmation(uuid, text, uuid) from public;
grant execute on function public.respond_client_confirmation(uuid, text, uuid) to authenticated;

-- Storage for logos (minimal confirm registration)
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

create policy "company_logos_public_read"
on storage.objects for select
using (bucket_id = 'company-logos');

create policy "company_logos_owner_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
