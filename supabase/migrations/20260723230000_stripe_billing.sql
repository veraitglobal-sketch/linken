-- Stripe billing — sensitive ids live here, not on public companies row.

create table if not exists public.company_billing (
  company_id uuid primary key references public.companies (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  billing_status text,
  plan_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists company_billing_customer_idx
  on public.company_billing (stripe_customer_id)
  where stripe_customer_id is not null;

alter table public.company_billing enable row level security;

create policy "company_billing_owner_select"
on public.company_billing for select
to authenticated
using (public.is_company_owner(company_id));

revoke all on table public.company_billing from public;
grant select on table public.company_billing to authenticated;

comment on table public.company_billing is
  'Stripe customer/subscription ids — owner-readable; writes via service_role webhooks only.';
