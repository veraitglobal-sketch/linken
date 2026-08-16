-- Developer partner: same login, distinct workspace (not a normal company shell).

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
      'developer_partner',
      'other'
    )
  );

comment on column public.companies.organization_kind is
  'Legal/organizational form. developer_partner uses the partner workspace shell.';
