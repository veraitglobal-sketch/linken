-- Admin ops tables: email suppressions, deliverability events, trust disputes.

create table public.email_suppressions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('address', 'domain')),
  value text not null,
  reason text not null default '',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  constraint email_suppressions_value_nonempty check (length(trim(value)) > 0),
  constraint email_suppressions_unique unique (kind, value)
);

create index email_suppressions_value_idx
  on public.email_suppressions (lower(value));

alter table public.email_suppressions enable row level security;
revoke all on table public.email_suppressions from public;
revoke all on table public.email_suppressions from anon, authenticated;

create table public.email_deliverability_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('bounce', 'complaint', 'delivery')),
  email text not null default '',
  domain text not null default '',
  provider_event_id text,
  payload jsonb,
  created_at timestamptz not null default now(),
  constraint email_deliverability_events_email_or_domain check (
    length(trim(email)) > 0 or length(trim(domain)) > 0
  )
);

create unique index email_deliverability_events_provider_uidx
  on public.email_deliverability_events (provider_event_id)
  where provider_event_id is not null;

create index email_deliverability_events_created_idx
  on public.email_deliverability_events (created_at desc);

alter table public.email_deliverability_events enable row level security;
revoke all on table public.email_deliverability_events from public;
revoke all on table public.email_deliverability_events from anon, authenticated;

-- Contested trust records. Public never sees "disputed" — record is hidden immediately.
create table public.trust_disputes (
  id uuid primary key default gen_random_uuid(),
  record_type text not null check (
    record_type in ('testimonial', 'service_reference', 'partnership', 'case_study_confirmation')
  ),
  record_id uuid not null,
  claimant_company_id uuid not null references public.companies (id) on delete cascade,
  counterparty_company_id uuid references public.companies (id) on delete set null,
  claim text not null,
  status text not null default 'open'
    check (status in ('open', 'confirmed', 'removed')),
  prior_public_state jsonb,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users (id) on delete set null,
  resolution_reason text,
  constraint trust_disputes_claim_nonempty check (length(trim(claim)) > 0)
);

create index trust_disputes_status_idx
  on public.trust_disputes (status, opened_at desc);

create unique index trust_disputes_open_record_uidx
  on public.trust_disputes (record_type, record_id)
  where status = 'open';

alter table public.trust_disputes enable row level security;
revoke all on table public.trust_disputes from public;
revoke all on table public.trust_disputes from anon, authenticated;

comment on table public.email_suppressions is
  'Addresses/domains that must never be mailed. Honoured by every sender.';

comment on table public.trust_disputes is
  'Staff dispute queue. Opening hides the record immediately; resolution is confirm or remove — never a public disputed marker.';
