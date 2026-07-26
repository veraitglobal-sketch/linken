-- Public booking link for company profiles (Calendly / Cal.com).
-- OAuth tokens are not stored long-term in v1 — we persist the public URL only.

alter table public.companies
  add column if not exists scheduling_provider text
    check (
      scheduling_provider is null
      or scheduling_provider in ('calendly', 'calcom')
    ),
  add column if not exists scheduling_url text,
  add column if not exists scheduling_label text not null default 'Book a call';

comment on column public.companies.scheduling_provider is
  'calendly | calcom when a booking link is connected.';
comment on column public.companies.scheduling_url is
  'Public booking URL visitors open (Calendly or Cal.com).';
comment on column public.companies.scheduling_label is
  'CTA label on the public profile (default Book a call).';

grant select (scheduling_provider, scheduling_url, scheduling_label)
  on public.companies to anon, authenticated;
