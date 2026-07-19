-- Partner logo opt-out for Logo wall website widgets

alter table public.companies
  add column if not exists allow_logo_in_partner_widgets boolean not null default true;

comment on column public.companies.allow_logo_in_partner_widgets is
  'When false, other firms show this company as text (name only) in Logo wall embeds — partnership stays public.';

grant select (allow_logo_in_partner_widgets) on public.companies to anon, authenticated;
