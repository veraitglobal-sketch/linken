-- Staff-assigned plans stay until staff clears them. Stripe sync skips plan writes when locked.

alter table public.companies
  add column if not exists staff_plan_lock boolean not null default false;

comment on column public.companies.staff_plan_lock is
  'When true, Stripe webhooks must not change companies.plan; only staff can clear via adminSetPlan(free).';
