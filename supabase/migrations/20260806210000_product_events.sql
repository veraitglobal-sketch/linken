-- Provider-agnostic product analytics (no PII — company_id + event + allowlisted props).

create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies (id) on delete cascade,
  event_name text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint product_events_name_check check (
    char_length(event_name) between 3 and 64
  )
);

comment on table public.product_events is
  'Product analytics events. Never store emails, names, tokens, or relationship payloads.';

create index if not exists product_events_company_created_idx
  on public.product_events (company_id, created_at desc);

create index if not exists product_events_name_created_idx
  on public.product_events (event_name, created_at desc);

-- Once-per-company funnel events (dedupe).
create unique index if not exists product_events_once_per_company_idx
  on public.product_events (company_id, event_name)
  where company_id is not null
    and event_name in (
      'company_created',
      'domain_verified',
      'first_project_created',
      'first_invitation_sent',
      'first_invitation_opened',
      'first_reference_confirmed',
      'first_reference_published',
      'invited_company_confirmed',
      'invited_company_created_profile',
      'invited_company_sent_first_invitation',
      'subscription_started'
    );

alter table public.product_events enable row level security;

create policy product_events_select_own
  on public.product_events
  for select
  to authenticated
  using (
    company_id is not null
    and exists (
      select 1
      from public.companies c
      where c.id = product_events.company_id
        and (
          c.owner_id = auth.uid()
          or public.is_company_operator(c.id)
        )
    )
  );

revoke all on table public.product_events from public;
grant select on table public.product_events to authenticated;
grant all on table public.product_events to service_role;

-- Idempotent insert for once-per-company events.
create or replace function public.track_product_event_once(
  p_company_id uuid,
  p_event_name text,
  p_props jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_company_id is null or p_event_name is null then
    return;
  end if;
  if exists (
    select 1
    from public.product_events e
    where e.company_id = p_company_id
      and e.event_name = p_event_name
  ) then
    return;
  end if;
  begin
    insert into public.product_events (company_id, event_name, props)
    values (p_company_id, p_event_name, coalesce(p_props, '{}'::jsonb));
  exception
    when unique_violation then
      null;
  end;
end;
$$;

revoke all on function public.track_product_event_once(uuid, text, jsonb) from public;
grant execute on function public.track_product_event_once(uuid, text, jsonb) to service_role;
