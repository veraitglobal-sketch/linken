-- Partner rail presentation: order + how many show on the company profile.
-- Shape: { "sortIds": ["company-uuid", ...], "limit": 12 }
-- Evidence / partnerships unchanged — this is display only.

alter table public.companies
  add column if not exists partner_rail jsonb not null default '{}'::jsonb;

comment on column public.companies.partner_rail is
  'Public partner rail: sortIds (partner company ids) and limit (3–40, default 12).';

grant select (partner_rail) on public.companies to anon, authenticated;
