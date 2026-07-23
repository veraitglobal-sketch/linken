-- Case study context — sector, scope, optional client label before confirmation.

alter table public.case_studies
  add column if not exists sector text not null default '',
  add column if not exists scope text not null default '',
  add column if not exists client_label text not null default '';

grant select (sector, scope, client_label)
  on public.case_studies to anon, authenticated;
