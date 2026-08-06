-- Product activation funnel events (no PII — company_id + event_type only).

create table if not exists public.activation_events (
  id uuid primary key default gen_random_uuid(),
  -- Null only for signup_completed (no company yet). Never store PII.
  company_id uuid references public.companies (id) on delete cascade,
  event_type text not null,
  created_at timestamptz not null default now(),
  constraint activation_events_type_check check (
    event_type in (
      'signup_completed',
      'company_created',
      'domain_verification_started',
      'domain_verified',
      'first_project_created',
      'first_invitation_started',
      'first_invitation_sent',
      'first_invitation_opened',
      'first_reference_confirmed',
      'first_reference_published'
    )
  ),
  constraint activation_events_company_required check (
    company_id is not null or event_type = 'signup_completed'
  )
);

create index if not exists activation_events_company_created_idx
  on public.activation_events (company_id, created_at desc);

create index if not exists activation_events_type_created_idx
  on public.activation_events (event_type, created_at desc);

alter table public.activation_events enable row level security;

-- Owners can read their own funnel; writes via service_role only.
create policy activation_events_select_own
  on public.activation_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.companies c
      where c.id = activation_events.company_id
        and (
          c.owner_id = auth.uid()
          or public.is_company_operator(c.id)
        )
    )
  );

revoke all on table public.activation_events from public;
grant select on table public.activation_events to authenticated;
grant all on table public.activation_events to service_role;
