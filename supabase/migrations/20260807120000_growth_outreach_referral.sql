-- Growth loop: outreach preferences + soft referral attribution (internal).

alter table public.companies
  add column if not exists invite_reminders_enabled boolean not null default true;

alter table public.companies
  add column if not exists referred_by_company_id uuid
    references public.companies (id) on delete set null;

comment on column public.companies.invite_reminders_enabled is
  'When false, operators cannot send reminder invite emails from this company.';

comment on column public.companies.referred_by_company_id is
  'Internal growth attribution only — never expose in public API or profile.';

-- Reminder cooldown touches partnerships.updated_at
alter table public.partnerships
  add column if not exists updated_at timestamptz not null default now();
