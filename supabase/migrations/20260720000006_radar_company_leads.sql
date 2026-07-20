-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260720000006
-- name: radar_company_leads
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

-- Radar company leads: saved searches + discovery feed.
-- Matched firms are public directory data; contact only via intro flow.

create or replace function public.company_trust_level(p_company_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_partners int := 0;
  v_ended_refs int := 0;
  v_ongoing_refs int := 0;
  v_client_cs int := 0;
  v_partner_cs int := 0;
  v_points int := 0;
begin
  if p_company_id is null then
    return 'member';
  end if;

  select
    (
      select count(*)::int from public.partnerships p
      where p.status = 'accepted'
        and (p.requester_id = p_company_id or p.recipient_id = p_company_id)
    ),
    (
      select count(*)::int from public.service_references r
      where r.provider_company_id = p_company_id
        and r.status = 'confirmed'
        and r.ongoing is false
    ),
    (
      select count(*)::int from public.service_references r
      where r.provider_company_id = p_company_id
        and r.status = 'confirmed'
        and r.ongoing is true
    )
  into v_partners, v_ended_refs, v_ongoing_refs;

  select count(distinct cscr.case_study_id)::int
  into v_client_cs
  from public.case_studies cs
  join public.case_study_client_confirmation_requests cscr
    on cscr.case_study_id = cs.id
   and cscr.status = 'confirmed'
  where cs.company_id = p_company_id;

  select count(distinct csp.case_study_id)::int
  into v_partner_cs
  from public.case_studies cs
  join public.case_study_partners csp
    on csp.case_study_id = cs.id
   and csp.confirmed is true
  where cs.company_id = p_company_id
    and not exists (
      select 1 from public.case_study_client_confirmation_requests cscr
      where cscr.case_study_id = cs.id and cscr.status = 'confirmed'
    );

  v_points :=
    v_partners * 2
    + v_ended_refs * 2
    + v_ongoing_refs * 3
    + v_client_cs * 3
    + v_partner_cs * 2;

  if v_points >= 40 and v_ongoing_refs >= 3 and v_partners >= 5 then
    return 'pillar';
  elsif v_points >= 15 and v_ongoing_refs >= 1 then
    return 'trusted';
  elsif v_points >= 5 then
    return 'established';
  end if;

  return 'member';
end;
$$;

revoke all on function public.company_trust_level(uuid) from public, anon;
grant execute on function public.company_trust_level(uuid) to authenticated, service_role;

create or replace function public.trust_level_rank(p_level text)
returns int
language sql
immutable
as $$
  select case lower(coalesce(p_level, 'member'))
    when 'pillar' then 3
    when 'trusted' then 2
    when 'established' then 1
    else 0
  end;
$$;

revoke all on function public.trust_level_rank(text) from public, anon;
grant execute on function public.trust_level_rank(text) to authenticated, service_role;

create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  category text,
  country text,
  city text,
  min_trust_level text
    check (
      min_trust_level is null
      or min_trust_level in ('member', 'established', 'trusted', 'pillar')
    ),
  only_verified boolean not null default true,
  only_accepting boolean not null default false,
  created_at timestamptz not null default now()
);

create index saved_searches_company_idx
  on public.saved_searches (company_id, created_at desc);

alter table public.saved_searches enable row level security;

create policy "saved_searches_owner_select"
on public.saved_searches for select
to authenticated
using (public.is_company_owner(company_id));

create policy "saved_searches_owner_insert"
on public.saved_searches for insert
to authenticated
with check (public.is_company_owner(company_id));

create policy "saved_searches_owner_update"
on public.saved_searches for update
to authenticated
using (public.is_company_owner(company_id))
with check (public.is_company_owner(company_id));

create policy "saved_searches_owner_delete"
on public.saved_searches for delete
to authenticated
using (public.is_company_owner(company_id));

revoke all on table public.saved_searches from public;
revoke all on table public.saved_searches from anon;
grant select, insert, update, delete on table public.saved_searches to authenticated;
grant all on table public.saved_searches to service_role;

create table public.radar_feed_items (
  id bigint generated always as identity primary key,
  company_id uuid not null references public.companies (id) on delete cascade,
  saved_search_id uuid references public.saved_searches (id) on delete cascade,
  matched_company_id uuid not null references public.companies (id) on delete cascade,
  reason text not null
    check (reason in (
      'new_company', 'became_verified', 'accepting_clients', 'level_up'
    )),
  created_at timestamptz not null default now(),
  seen_at timestamptz,
  constraint radar_feed_unique unique (company_id, matched_company_id, reason),
  constraint radar_feed_not_self check (company_id <> matched_company_id)
);

create index radar_feed_owner_idx
  on public.radar_feed_items (company_id, created_at desc);

create index radar_feed_unseen_idx
  on public.radar_feed_items (company_id, created_at desc)
  where seen_at is null;

alter table public.radar_feed_items enable row level security;

create policy "radar_feed_owner_select"
on public.radar_feed_items for select
to authenticated
using (public.is_company_owner(company_id));

create policy "radar_feed_owner_update_seen"
on public.radar_feed_items for update
to authenticated
using (public.is_company_owner(company_id))
with check (public.is_company_owner(company_id));

revoke all on table public.radar_feed_items from public;
revoke all on table public.radar_feed_items from anon;
grant select, update on table public.radar_feed_items to authenticated;
grant all on table public.radar_feed_items to service_role;

create or replace function public.company_matches_saved_search(
  p_matched public.companies,
  p_search public.saved_searches
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_matched.claimed is not true then
    return false;
  end if;

  if p_search.category is not null
     and trim(p_search.category) <> ''
     and lower(coalesce(p_matched.category, '')) <> lower(trim(p_search.category))
  then
    return false;
  end if;

  if p_search.country is not null
     and trim(p_search.country) <> ''
     and lower(coalesce(p_matched.country, '')) <> lower(trim(p_search.country))
  then
    return false;
  end if;

  if p_search.city is not null
     and trim(p_search.city) <> ''
     and lower(coalesce(p_matched.city, '')) <> lower(trim(p_search.city))
  then
    return false;
  end if;

  if p_search.only_verified and coalesce(p_matched.verified, false) is not true then
    return false;
  end if;

  if p_search.only_accepting
     and coalesce(p_matched.accepting_clients, false) is not true
  then
    return false;
  end if;

  if p_search.min_trust_level is not null
     and public.trust_level_rank(public.company_trust_level(p_matched.id))
        < public.trust_level_rank(p_search.min_trust_level)
  then
    return false;
  end if;

  return true;
end;
$$;

revoke all on function public.company_matches_saved_search(public.companies, public.saved_searches)
  from public, anon, authenticated;
grant execute on function public.company_matches_saved_search(public.companies, public.saved_searches)
  to service_role;

create or replace function public.match_company_to_searches(
  p_company_id uuid,
  p_reason text
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_matched public.companies%rowtype;
  v_search public.saved_searches%rowtype;
  v_inserted int := 0;
  v_row int;
begin
  if p_reason not in (
    'new_company', 'became_verified', 'accepting_clients', 'level_up'
  ) then
    raise exception 'invalid reason';
  end if;

  select * into v_matched
  from public.companies
  where id = p_company_id;

  if not found or v_matched.claimed is not true then
    return 0;
  end if;

  for v_search in
    select s.*
    from public.saved_searches s
    where s.company_id <> p_company_id
  loop
    if public.company_matches_saved_search(v_matched, v_search) then
      insert into public.radar_feed_items (
        company_id, saved_search_id, matched_company_id, reason
      )
      values (
        v_search.company_id, v_search.id, p_company_id, p_reason
      )
      on conflict (company_id, matched_company_id, reason) do nothing;

      get diagnostics v_row = row_count;
      v_inserted := v_inserted + v_row;
    end if;
  end loop;

  return v_inserted;
end;
$$;

revoke all on function public.match_company_to_searches(uuid, text)
  from public, anon, authenticated;
grant execute on function public.match_company_to_searches(uuid, text)
  to service_role;

create or replace function public.backfill_saved_search_feed(p_search_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_search public.saved_searches%rowtype;
  v_matched public.companies%rowtype;
  v_inserted int := 0;
  v_row int;
begin
  select * into v_search
  from public.saved_searches
  where id = p_search_id;

  if not found then
    return 0;
  end if;

  if auth.uid() is not null
     and not public.is_company_owner(v_search.company_id)
  then
    raise exception 'not allowed';
  end if;

  for v_matched in
    select c.*
    from public.companies c
    where c.claimed is true
      and c.id <> v_search.company_id
    order by c.created_at desc nulls last
    limit 200
  loop
    exit when v_inserted >= 20;

    if public.company_matches_saved_search(v_matched, v_search) then
      insert into public.radar_feed_items (
        company_id, saved_search_id, matched_company_id, reason
      )
      values (
        v_search.company_id,
        v_search.id,
        v_matched.id,
        'new_company'
      )
      on conflict (company_id, matched_company_id, reason) do nothing;

      get diagnostics v_row = row_count;
      v_inserted := v_inserted + v_row;
    end if;
  end loop;

  return v_inserted;
end;
$$;

revoke all on function public.backfill_saved_search_feed(uuid)
  from public, anon;
grant execute on function public.backfill_saved_search_feed(uuid)
  to authenticated, service_role;

create or replace function public.get_radar_digest(p_company_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_leads int := 0;
  v_requests int := 0;
  v_category text;
  v_city text;
begin
  if auth.uid() is not null
     and not public.is_company_owner(p_company_id)
     and coalesce(auth.role(), '') <> 'service_role'
  then
    raise exception 'not allowed';
  end if;

  select count(*)::int into v_leads
  from public.radar_feed_items f
  where f.company_id = p_company_id
    and f.created_at >= now() - interval '7 days';

  select c.category, c.city
  into v_category, v_city
  from public.companies c
  where c.id = p_company_id;

  select count(*)::int into v_requests
  from public.project_requests pr
  where pr.status = 'open'
    and (pr.expires_at is null or pr.expires_at > now())
    and lower(coalesce(pr.category, '')) = lower(coalesce(v_category, ''))
    and lower(coalesce(pr.city, '')) = lower(coalesce(v_city, ''))
    and pr.created_at >= now() - interval '7 days';

  return jsonb_build_object(
    'company_id', p_company_id,
    'company_leads', v_leads,
    'project_requests', v_requests,
    'window_days', 7
  );
end;
$$;

revoke all on function public.get_radar_digest(uuid) from public, anon;
grant execute on function public.get_radar_digest(uuid)
  to authenticated, service_role;

comment on function public.match_company_to_searches(uuid, text) is
  'Radar discovery: fan-out matched company into owners feeds. service_role only.';
comment on function public.backfill_saved_search_feed(uuid) is
  'One-shot fill when a saved search is created (max 20).';
comment on function public.get_radar_digest(uuid) is
  'Weekly Radar digest counts. Cron wiring TODO.';
