-- Track scheduled cancellations (cancel_at_period_end) without extra Stripe reads.

alter table public.company_billing
  add column if not exists cancel_at_period_end boolean not null default false;

comment on column public.company_billing.cancel_at_period_end is
  'True when Stripe subscription is set to end after the current period.';
