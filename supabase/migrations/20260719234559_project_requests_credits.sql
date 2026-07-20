-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260719234559
-- name: project_requests_credits
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

-- Project Requests: lead marketplace with credits.
-- Sacred rule: profile inquiries stay free forever. Credits apply ONLY to
-- platform-distributed project_requests — never to leads a firm earned itself.

create table public.project_requests (
  id uuid primary key default gen_random_uuid(),
  requester_name text not null,
  requester_email text not null,
  requester_company text not null default '',
  category text not null,
  city text not null,
  country text not null default '',
  title text not null,
  description text not null,
  budget_hint text not null default '',
  timeline text not null default '',
  status text not null default 'open'
    check (status in ('open', 'closed', 'expired')),
  max_responses int not null default 5,
  manage_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create index project_requests_open_match_idx
  on public.project_requests (lower(category), lower(city), status, expires_at)
  where status = 'open';

create table public.request_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.project_requests (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  message text not null,
  status text not null default 'sent'
    check (status in ('sent', 'seen', 'shortlisted', 'declined', 'refunded')),
  credit_spent boolean not null default true,
  created_at timestamptz not null default now(),
  seen_at timestamptz,
  constraint one_response_per_request unique (request_id, company_id)
);

create index request_responses_company_idx
  on public.request_responses (company_id, created_at desc);

create index request_responses_request_idx
  on public.request_responses (request_id, created_at);

create table public.company_credits (
  company_id uuid primary key references public.companies (id) on delete cascade,
  balance int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table public.credit_ledger (
  id bigint generated always as identity primary key,
  company_id uuid not null references public.companies (id) on delete cascade,
  delta int not null,
  reason text not null
    check (reason in ('monthly_grant', 'response', 'refund', 'purchase', 'admin')),
  reference_id uuid,
  created_at timestamptz not null default now()
);

create index credit_ledger_company_idx
  on public.credit_ledger (company_id, created_at desc);

create table public.request_digest_queue (
  company_id uuid not null references public.companies (id) on delete cascade,
  request_id uuid not null references public.project_requests (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (company_id, request_id)
);

create table public.request_digest_sent (
  company_id uuid primary key references public.companies (id) on delete cascade,
  last_sent_at timestamptz not null default now()
);

alter table public.project_requests enable row level security;
alter table public.request_responses enable row level security;
alter table public.company_credits enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.request_digest_queue enable row level security;
alter table public.request_digest_sent enable row level security;

revoke all on table public.project_requests from public;
revoke all on table public.project_requests from anon, authenticated;

create policy "request_responses_owner_select"
on public.request_responses for select
to authenticated
using (public.is_company_owner(company_id));

revoke all on table public.request_responses from public;
revoke all on table public.request_responses from anon, authenticated;

grant select (
  id, request_id, company_id, message, status, credit_spent, created_at, seen_at
) on table public.request_responses to authenticated;

create policy "company_credits_owner_select"
on public.company_credits for select
to authenticated
using (public.is_company_owner(company_id));

create policy "credit_ledger_owner_select"
on public.credit_ledger for select
to authenticated
using (public.is_company_owner(company_id));

revoke all on table public.company_credits from public;
revoke all on table public.company_credits from anon, authenticated;
grant select (company_id, balance, updated_at)
  on table public.company_credits to authenticated;

revoke all on table public.credit_ledger from public;
revoke all on table public.credit_ledger from anon, authenticated;
grant select (id, company_id, delta, reason, reference_id, created_at)
  on table public.credit_ledger to authenticated;

revoke all on table public.request_digest_queue from public;
revoke all on table public.request_digest_queue from anon, authenticated;
revoke all on table public.request_digest_sent from public;
revoke all on table public.request_digest_sent from anon, authenticated;
