-- Unique visits: one visitor, one day, one event type.
-- Hash is stored, never the IP. Inquiries stay one row per send.

alter table public.profile_events
  add column if not exists visitor_hash text,
  add column if not exists visit_day date not null default (timezone('utc', now()))::date;

create unique index if not exists profile_events_visitor_day_uidx
  on public.profile_events (company_id, event_type, visitor_hash, visit_day)
  where visitor_hash is not null
    and event_type <> 'inquiry';

drop function if exists public.log_profile_event(text, text, text);

create function public.log_profile_event(
  p_company_slug text,
  p_event_type text,
  p_source text default 'direct',
  p_visitor_hash text default null
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
  v_hash text := nullif(trim(coalesce(p_visitor_hash, '')), '');
  v_day date := (timezone('utc', now()))::date;
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

  if v_hash is not null and v_type <> 'inquiry' then
    insert into public.profile_events (
      company_id, event_type, source, visitor_hash, visit_day
    )
    values (v_company_id, v_type, v_source, v_hash, v_day)
    on conflict (company_id, event_type, visitor_hash, visit_day)
      where visitor_hash is not null and event_type <> 'inquiry'
    do nothing;
  else
    insert into public.profile_events (company_id, event_type, source, visit_day)
    values (v_company_id, v_type, v_source, v_day);
  end if;
end;
$$;

revoke all on function public.log_profile_event(text, text, text, text) from public;
grant execute on function public.log_profile_event(text, text, text, text)
  to anon, authenticated;

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
  v_days int := least(greatest(coalesce(p_days, 30), 1), 365);
  v_since timestamptz := now() - (v_days || ' days')::interval;
  v_result jsonb;
begin
  if not public.is_company_operator(p_company_id) then
    raise exception 'Not company operator';
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
    'embed_clicks', coalesce((
      select count(*)::int
      from public.profile_events e
      where e.company_id = p_company_id
        and e.created_at >= v_since
        and e.event_type = 'profile_view'
        and e.source = 'embed'
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
          and e.event_type in ('profile_view', 'qr_scan')
        group by e.source
      ) t
    ), '{}'::jsonb),
    'by_day', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'day', day::text,
          'count', visits + one_pager + embed,
          'visits', visits,
          'inquiries', inquiries,
          'one_pager', one_pager,
          'embed', embed,
          'embed_clicks', embed_clicks
        )
        order by day
      )
      from (
        select
          date_trunc('day', e.created_at)::date as day,
          count(*) filter (
            where e.event_type in ('profile_view', 'qr_scan')
          )::int as visits,
          count(*) filter (where e.event_type = 'inquiry')::int as inquiries,
          count(*) filter (where e.event_type = 'one_pager_view')::int as one_pager,
          count(*) filter (where e.event_type = 'embed_view')::int as embed,
          count(*) filter (
            where e.event_type = 'profile_view' and e.source = 'embed'
          )::int as embed_clicks
        from public.profile_events e
        where e.company_id = p_company_id
          and e.created_at >= v_since
          and e.event_type in (
            'profile_view', 'qr_scan', 'one_pager_view', 'embed_view', 'inquiry'
          )
        group by 1
      ) d
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;
