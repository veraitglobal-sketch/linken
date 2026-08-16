-- invite_reminders_enabled was added without column SELECT grant.
-- companies uses explicit column grants (never select *); edit page selects
-- this column and fails with permission denied → "Could not open editor".

grant select (invite_reminders_enabled) on public.companies to authenticated;

comment on column public.companies.invite_reminders_enabled is
  'When false, operators cannot send reminder invite emails from this company.';
