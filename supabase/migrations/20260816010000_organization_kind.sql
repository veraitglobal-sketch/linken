-- Organization kind: company, nonprofit, association, public body, political party, etc.
-- UI says "organization"; table remains companies for compatibility.

alter table public.companies
  add column if not exists organization_kind text not null default 'company';

alter table public.companies
  drop constraint if exists companies_organization_kind_valid;

alter table public.companies
  add constraint companies_organization_kind_valid check (
    organization_kind in (
      'company',
      'nonprofit',
      'association',
      'public_body',
      'political_party',
      'cooperative',
      'other'
    )
  );

comment on column public.companies.organization_kind is
  'Legal/organizational form chosen at onboarding. Sector stays in category.';

-- Column-level select (companies uses explicit grants, never select *)
grant select (organization_kind) on public.companies to anon, authenticated;
