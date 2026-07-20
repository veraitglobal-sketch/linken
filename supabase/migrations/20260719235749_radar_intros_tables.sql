-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260719235749
-- name: radar_intros_tables
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

alter table public.companies
  add column if not exists receive_intros boolean not null default true;

alter table public.companies
  add column if not exists intro_suspended_until timestamptz;

update public.companies
set receive_intros = coalesce(accepting_clients, true)
where true;

revoke select (receive_intros, intro_suspended_until) on public.companies from anon, public;
grant select (receive_intros, intro_suspended_until) on public.companies to authenticated;

alter table public.credit_ledger
  drop constraint if exists credit_ledger_reason_check;

alter table public.credit_ledger
  add constraint credit_ledger_reason_check
  check (reason in (
    'monthly_grant', 'response', 'refund', 'purchase', 'admin',
    'intro', 'intro_not_relevant'
  ));

create table if not exists public.intros (
  id uuid primary key default gen_random_uuid(),
  sender_company_id uuid not null references public.companies (id) on delete cascade,
  recipient_company_id uuid not null references public.companies (id) on delete cascade,
  offer text not null,
  why_relevant text not null,
  message text not null,
  status text not null default 'sent'
    check (status in ('sent', 'seen', 'replied', 'not_relevant')),
  created_at timestamptz not null default now(),
  constraint intros_not_self check (sender_company_id <> recipient_company_id)
);

create index if not exists intros_sender_idx
  on public.intros (sender_company_id, created_at desc);

create index if not exists intros_recipient_idx
  on public.intros (recipient_company_id, created_at desc);

alter table public.intros enable row level security;

drop policy if exists "intros_sender_select" on public.intros;
create policy "intros_sender_select"
on public.intros for select
to authenticated
using (public.is_company_owner(sender_company_id));

drop policy if exists "intros_recipient_select" on public.intros;
create policy "intros_recipient_select"
on public.intros for select
to authenticated
using (public.is_company_owner(recipient_company_id));

revoke all on table public.intros from public;
revoke all on table public.intros from anon, authenticated;

grant select (
  id, sender_company_id, recipient_company_id,
  offer, why_relevant, message, status, created_at
) on table public.intros to authenticated;
