-- Staff may hide a company from public surfaces. Never rewrite identity fields.
-- Hidden rows stay in the workspace so the owner can still sign in.

alter table public.companies
  add column if not exists staff_hidden_at timestamptz;

create index if not exists companies_staff_hidden_idx
  on public.companies (staff_hidden_at)
  where staff_hidden_at is not null;

comment on column public.companies.staff_hidden_at is
  'Set by platform staff. Public surfaces treat the company as no_file. Workspace still loads.';

revoke all (staff_hidden_at) on public.companies from anon, authenticated;

drop policy if exists "companies_public_read" on public.companies;
create policy "companies_public_read"
on public.companies for select
using (
  staff_hidden_at is null
  and merged_into_company_id is null
);

drop policy if exists "companies_operator_select" on public.companies;
create policy "companies_operator_select"
on public.companies for select
to authenticated
using (public.is_company_operator(id));
