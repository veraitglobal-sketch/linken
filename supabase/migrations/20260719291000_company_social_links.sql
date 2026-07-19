-- Public social profile links (LinkedIn, Facebook)

alter table public.companies
  add column if not exists linkedin_url text,
  add column if not exists facebook_url text;

grant select (linkedin_url, facebook_url) on public.companies to anon, authenticated;
