-- Duplicate merge: soft-mark fallback when a loser company cannot be hard
-- deleted (FK references outside the tables the merge action repoints).

alter table public.companies
  add column if not exists merged_into_company_id uuid
    references public.companies (id) on delete set null;

create index if not exists companies_merged_into_idx
  on public.companies (merged_into_company_id)
  where merged_into_company_id is not null;

comment on column public.companies.merged_into_company_id is
  'Set by admin duplicate-merge when the loser row could not be hard-deleted. Never exposed to anon/authenticated.';
