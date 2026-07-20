-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260720145204
-- name: group_logo_pipeline
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

-- Group auto-logo: source tracking + refresh rate limit (mirror companies)

alter table public.company_groups
  add column if not exists logo_source text;

alter table public.company_groups
  drop constraint if exists company_groups_logo_source_check;

alter table public.company_groups
  add constraint company_groups_logo_source_check
  check (logo_source is null or logo_source in ('auto', 'manual'));

alter table public.company_groups
  add column if not exists logo_refresh_window_start timestamptz;

alter table public.company_groups
  add column if not exists logo_refresh_count int not null default 0;

-- Public columns only (hide refresh counters)
revoke select on public.company_groups from anon, authenticated;
grant select (
  id, name, slug, description, website, logo_url, logo_source, created_by, created_at
) on public.company_groups to anon, authenticated;

-- Creator-only: max 3 logo refreshes per calendar day
create or replace function public.record_group_logo_refresh_attempt(p_group_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz;
  v_count int;
begin
  if auth.uid() is null then
    raise exception 'Not allowed';
  end if;

  select logo_refresh_window_start, logo_refresh_count
  into v_start, v_count
  from public.company_groups
  where id = p_group_id
    and created_by = auth.uid()
  for update;

  if not found then
    raise exception 'Not allowed';
  end if;

  if v_start is null or v_start < date_trunc('day', now()) then
    update public.company_groups
    set logo_refresh_window_start = now(),
        logo_refresh_count = 1
    where id = p_group_id;
    return true;
  end if;

  if v_count >= 3 then
    return false;
  end if;

  update public.company_groups
  set logo_refresh_count = logo_refresh_count + 1
  where id = p_group_id;

  return true;
end;
$$;

revoke all on function public.record_group_logo_refresh_attempt(uuid) from public;
grant execute on function public.record_group_logo_refresh_attempt(uuid) to authenticated;
