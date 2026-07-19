-- Per-company widget presentation settings (JSON).
-- Shape (documented):
-- {
--   "logoWall": {
--     "excludedCompanyIds": ["uuid", ...]  -- omitted/empty = show all confirmed (default)
--   }
-- }
-- Evidence stays free on the profile; this only controls the paid Logo wall presentation.

alter table public.companies
  add column if not exists widget_settings jsonb not null default '{}'::jsonb;

comment on column public.companies.widget_settings is
  'Presentation settings for website widgets. logoWall.excludedCompanyIds hides confirmed firms from the public Logo wall (default: show all).';

grant select (widget_settings) on public.companies to anon, authenticated;
-- Owners update via existing companies UPDATE RLS (owner-only).
