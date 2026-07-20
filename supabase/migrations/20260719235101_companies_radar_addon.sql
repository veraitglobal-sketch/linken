-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260719235101
-- name: companies_radar_addon
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

alter table public.companies
  add column if not exists radar boolean not null default false;

grant select (radar) on public.companies to authenticated;
