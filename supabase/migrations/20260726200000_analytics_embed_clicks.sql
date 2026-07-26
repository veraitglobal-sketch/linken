-- Embed click-throughs: profile_view with source=embed (?src=embed from widgets).

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
          count(*) filter (
            where e.event_type = 'inquiry'
          )::int as inquiries,
          count(*) filter (
            where e.event_type = 'one_pager_view'
          )::int as one_pager,
          count(*) filter (
            where e.event_type = 'embed_view'
          )::int as embed,
          count(*) filter (
            where e.event_type = 'profile_view' and e.source = 'embed'
          )::int as embed_clicks
        from public.profile_events e
        where e.company_id = p_company_id
          and e.created_at >= v_since
          and e.event_type in (
            'profile_view',
            'qr_scan',
            'one_pager_view',
            'embed_view',
            'inquiry'
          )
        group by 1
      ) d
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;
