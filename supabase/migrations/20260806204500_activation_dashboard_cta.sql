-- Allow dashboard CTA funnel events (cta id in detail — never PII).

alter table public.activation_events
  drop constraint if exists activation_events_type_check;

alter table public.activation_events
  add constraint activation_events_type_check check (
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
      'first_reference_published',
      'dashboard_cta_clicked'
    )
  );

alter table public.activation_events
  add column if not exists detail text;

comment on column public.activation_events.detail is
  'Optional non-PII detail (e.g. dashboard CTA id). Never store emails or names.';
