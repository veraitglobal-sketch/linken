-- Plan foundation + privacy-first profile analytics

alter table public.companies
  add column if not exists plan text not null default 'free'
  constraint companies_plan_check check (plan in ('free', 'pro', 'founding'));

grant select (plan) on public.companies to anon, authenticated;

create table public.profile_events (
  id bigint generated always as identity primary key,
  company_id uuid not null references public.companies (id) on delete cascade,
  event_type text not null
    check (event_type in (
      'profile_view',
      'one_pager_view',
      'embed_view',
      'inquiry',
      'qr_scan'
    )),
  source text not null default 'direct'
    check (source in (
      'direct',
      'search',
      'partner',
      'qr',
      'embed',
      'one_pager',
      'external'
    )),
  created_at timestamptz not null default now()
);

create index profile_events_company_day_idx
  on public.profile_events (company_id, created_at desc);

alter table public.profile_events enable row level security;

create policy "profile_events_owner_select"
on public.profile_events for select
to authenticated
using (public.is_company_owner(company_id));

-- No direct INSERT/UPDATE/DELETE for clients
revoke all on table public.profile_events from public;
revoke all on table public.profile_events from anon, authenticated;

grant select (
  id, company_id, event_type, source, created_at
) on table public.profile_events to authenticated;

create or replace function public.log_profile_event(
  p_company_slug text,
  p_event_type text,
  p_source text default 'direct'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_type text := trim(p_event_type);
  v_source text := coalesce(nullif(trim(p_source), ''), 'direct');
begin
  if v_type not in (
    'profile_view', 'one_pager_view', 'embed_view', 'inquiry', 'qr_scan'
  ) then
    raise exception 'Invalid event type';
  end if;

  if v_source not in (
    'direct', 'search', 'partner', 'qr', 'embed', 'one_pager', 'external'
  ) then
    raise exception 'Invalid source';
  end if;

  select c.id into v_company_id
  from public.companies c
  where c.slug = trim(p_company_slug)
    and c.claimed = true
  limit 1;

  if v_company_id is null then
    return;
  end if;

  insert into public.profile_events (company_id, event_type, source)
  values (v_company_id, v_type, v_source);
end;
$$;

revoke all on function public.log_profile_event(text, text, text) from public;
grant execute on function public.log_profile_event(text, text, text) to anon, authenticated;

-- Aggregated analytics for the company owner (privacy: counts only)
create or replace function public.get_profile_analytics(
  p_company_id uuid,
  p_days integer default 30
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days int := greatest(coalesce(p_days, 30), 1);
  v_since timestamptz := now() - (v_days || ' days')::interval;
  v_result jsonb;
begin
  if not public.is_company_owner(p_company_id) then
    raise exception 'Not company owner';
  end if;

  select jsonb_build_object(
    'days', v_days,
    'profile_views', coalesce((
      select count(*)::int
      from public.profile_events e
      where e.company_id = p_company_id
        and e.created_at >= v_since
        and e.event_type in ('profile_view', 'qr_scan')
    ), 0),
    'one_pager_views', coalesce((
      select count(*)::int
      from public.profile_events e
      where e.company_id = p_company_id
        and e.created_at >= v_since
        and e.event_type = 'one_pager_view'
    ), 0),
    'embed_views', coalesce((
      select count(*)::int
      from public.profile_events e
      where e.company_id = p_company_id
        and e.created_at >= v_since
        and e.event_type = 'embed_view'
    ), 0),
    'inquiries', coalesce((
      select count(*)::int
      from public.profile_events e
      where e.company_id = p_company_id
        and e.created_at >= v_since
        and e.event_type = 'inquiry'
    ), 0),
    'by_type', coalesce((
      select jsonb_object_agg(event_type, cnt)
      from (
        select e.event_type, count(*)::int as cnt
        from public.profile_events e
        where e.company_id = p_company_id
          and e.created_at >= v_since
        group by e.event_type
      ) t
    ), '{}'::jsonb),
    'by_source', coalesce((
      select jsonb_object_agg(source, cnt)
      from (
        select e.source, count(*)::int as cnt
        from public.profile_events e
        where e.company_id = p_company_id
          and e.created_at >= v_since
        group by e.source
      ) t
    ), '{}'::jsonb),
    'by_day', coalesce((
      select jsonb_agg(
        jsonb_build_object('day', day::text, 'count', cnt)
        order by day
      )
      from (
        select date_trunc('day', e.created_at)::date as day, count(*)::int as cnt
        from public.profile_events e
        where e.company_id = p_company_id
          and e.created_at >= v_since
          and e.event_type in (
            'profile_view', 'qr_scan', 'one_pager_view', 'embed_view'
          )
        group by 1
      ) d
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_profile_analytics(uuid, integer) from public;
grant execute on function public.get_profile_analytics(uuid, integer) to authenticated;
