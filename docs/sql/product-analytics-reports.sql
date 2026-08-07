-- Product analytics report queries (Supabase SQL editor / warehouse).
-- North-star: report_seven_day_activation_rate
-- Source table: public.product_events (+ public.companies for cohorts)

-- 1) Signup conversion (daily)
-- report_signup_conversion
with days as (
  select generate_series(
    date_trunc('day', now() - interval '28 days'),
    date_trunc('day', now()),
    interval '1 day'
  )::date as day
),
counts as (
  select
    date_trunc('day', created_at)::date as day,
    count(*) filter (where event_name = 'landing_page_viewed') as landings,
    count(*) filter (where event_name = 'signup_started') as started,
    count(*) filter (where event_name = 'signup_completed') as completed,
    count(*) filter (where event_name = 'company_created') as companies
  from public.product_events
  where created_at >= now() - interval '28 days'
  group by 1
)
select
  d.day,
  coalesce(c.landings, 0) as landings,
  coalesce(c.started, 0) as signup_started,
  coalesce(c.completed, 0) as signup_completed,
  coalesce(c.companies, 0) as company_created,
  case when coalesce(c.landings, 0) = 0 then null
       else round(100.0 * c.completed / c.landings, 1) end as signup_rate_pct
from days d
left join counts c on c.day = d.day
order by d.day;

-- 2) Time to first project (hours)
-- report_time_to_first_project
select
  percentile_cont(0.5) within group (
    order by extract(epoch from (p.created_at - c.created_at)) / 3600.0
  ) as median_hours,
  count(*) as n
from public.product_events p
join public.companies c on c.id = p.company_id
where p.event_name = 'first_project_created'
  and c.claimed is distinct from false;

-- 3) Invitation send rate (weekly cohort by company created)
-- report_invitation_send_rate
with cohort as (
  select id, date_trunc('week', created_at)::date as week
  from public.companies
  where claimed is distinct from false
    and created_at >= now() - interval '12 weeks'
),
sent as (
  select distinct company_id
  from public.product_events
  where event_name = 'first_invitation_sent'
)
select
  cohort.week,
  count(*) as companies,
  count(sent.company_id) as sent_invite,
  round(100.0 * count(sent.company_id) / nullif(count(*), 0), 1) as send_rate_pct
from cohort
left join sent on sent.company_id = cohort.id
group by 1
order by 1;

-- 4) Invitation open rate
-- report_invitation_open_rate
select
  date_trunc('week', s.created_at)::date as week,
  count(distinct s.company_id) as sent,
  count(distinct o.company_id) as opened,
  round(
    100.0 * count(distinct o.company_id) / nullif(count(distinct s.company_id), 0),
    1
  ) as open_rate_pct
from public.product_events s
left join public.product_events o
  on o.company_id = s.company_id
 and o.event_name = 'first_invitation_opened'
 and o.created_at >= s.created_at
where s.event_name = 'first_invitation_sent'
  and s.created_at >= now() - interval '12 weeks'
group by 1
order by 1;

-- 5) Invitation confirmation rate
-- report_invitation_confirmation_rate
select
  date_trunc('week', s.created_at)::date as week,
  count(distinct s.company_id) as sent,
  count(distinct c.company_id) as confirmed,
  round(
    100.0 * count(distinct c.company_id) / nullif(count(distinct s.company_id), 0),
    1
  ) as confirm_rate_pct
from public.product_events s
left join public.product_events c
  on c.company_id = s.company_id
 and c.event_name = 'first_reference_confirmed'
 and c.created_at >= s.created_at
where s.event_name = 'first_invitation_sent'
  and s.created_at >= now() - interval '12 weeks'
group by 1
order by 1;

-- 6) Time to first confirmed reference
-- report_time_to_first_confirmed_reference
select
  percentile_cont(0.5) within group (
    order by extract(epoch from (p.created_at - c.created_at)) / 3600.0
  ) as median_hours,
  count(*) as n
from public.product_events p
join public.companies c on c.id = p.company_id
where p.event_name = 'first_reference_confirmed'
  and c.claimed is distinct from false;

-- 7) NORTH STAR — seven-day activation rate
-- report_seven_day_activation_rate
with cohort as (
  select
    id,
    created_at,
    date_trunc('week', created_at)::date as week
  from public.companies
  where claimed is distinct from false
    and created_at >= now() - interval '12 weeks'
    and created_at < now() - interval '7 days' -- complete window only
),
activated as (
  select distinct on (p.company_id)
    p.company_id,
    p.created_at as activated_at
  from public.product_events p
  where p.event_name = 'first_reference_confirmed'
  order by p.company_id, p.created_at
)
select
  cohort.week,
  count(*) as companies,
  count(*) filter (
    where a.activated_at is not null
      and a.activated_at <= cohort.created_at + interval '7 days'
  ) as activated_within_7d,
  round(
    100.0 * count(*) filter (
      where a.activated_at is not null
        and a.activated_at <= cohort.created_at + interval '7 days'
    ) / nullif(count(*), 0),
    1
  ) as seven_day_activation_pct
from cohort
left join activated a on a.company_id = cohort.id
group by 1
order by 1;

-- 8) Invited-company conversion
-- report_invited_company_conversion
with confirmed as (
  select company_id, min(created_at) as at
  from public.product_events
  where event_name = 'invited_company_confirmed'
  group by 1
),
profiled as (
  select company_id, min(created_at) as at
  from public.product_events
  where event_name = 'invited_company_created_profile'
  group by 1
),
sent as (
  select company_id, min(created_at) as at
  from public.product_events
  where event_name = 'invited_company_sent_first_invitation'
  group by 1
)
select
  date_trunc('week', coalesce(c.at, p.at))::date as week,
  count(distinct c.company_id) as confirmed,
  count(distinct p.company_id) as created_profile,
  count(distinct s.company_id) as sent_first_invite,
  round(
    100.0 * count(distinct s.company_id) / nullif(count(distinct c.company_id), 0),
    1
  ) as viral_conversion_pct
from confirmed c
full outer join profiled p on p.company_id = c.company_id
left join sent s on s.company_id = coalesce(c.company_id, p.company_id)
group by 1
order by 1;

-- 9) Free-to-Pro conversion
-- report_free_to_pro_conversion
select
  date_trunc('week', v.created_at)::date as week,
  count(*) filter (where v.event_name = 'pricing_viewed') as pricing_views,
  count(*) filter (where v.event_name = 'checkout_started') as checkouts,
  count(*) filter (where v.event_name = 'subscription_started') as started,
  round(
    100.0
      * count(*) filter (where v.event_name = 'subscription_started')
      / nullif(count(*) filter (where v.event_name = 'pricing_viewed'), 0),
    1
  ) as view_to_sub_pct
from public.product_events v
where v.event_name in ('pricing_viewed', 'checkout_started', 'subscription_started')
  and v.created_at >= now() - interval '12 weeks'
group by 1
order by 1;

-- 10) Retention of activated companies (engagement days 8–35)
-- report_retention_activated_companies
with activated as (
  select company_id, min(created_at) as activated_at
  from public.product_events
  where event_name = 'first_reference_confirmed'
  group by 1
),
engaged as (
  select distinct a.company_id
  from activated a
  join public.product_events e on e.company_id = a.company_id
  where e.event_name in (
    'project_created',
    'invitation_sent',
    'profile_viewed',
    'embed_created',
    'embed_installed',
    'proposal_export_created',
    'checkout_started'
  )
    and e.created_at > a.activated_at + interval '7 days'
    and e.created_at <= a.activated_at + interval '35 days'
)
select
  date_trunc('week', a.activated_at)::date as activation_week,
  count(*) as activated,
  count(e.company_id) as retained_w2_w5,
  round(100.0 * count(e.company_id) / nullif(count(*), 0), 1) as retention_pct
from activated a
left join engaged e on e.company_id = a.company_id
where a.activated_at < now() - interval '35 days'
group by 1
order by 1;
