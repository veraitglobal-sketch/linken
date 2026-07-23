-- Hansala case study proof layer — beyond ordinary portfolios.

alter table public.case_studies
  add column if not exists highlight_stat text not null default '',
  add column if not exists duration text not null default '',
  add column if not exists client_quote text not null default '',
  add column if not exists metrics jsonb not null default '[]';

grant select (highlight_stat, duration, client_quote, metrics)
  on public.case_studies to anon, authenticated;
