-- Categories, follow-up: read grants for the two new company columns, plus the
-- categories and aliases the first backfill left unmatched on live data.
--
-- The columns landed without column-level grants, so any public read that
-- selects them fails with 42501 — the ranking pages and the profile chip both
-- need them. Grants follow the pattern of every other public column here.

grant select (category_slug, country_code) on public.companies to anon, authenticated;
grant insert (category_slug, country_code) on public.companies to authenticated;
grant update (category_slug, country_code) on public.companies to authenticated;

-- Sectors the live data asked for: farms and a call centre had no home.
insert into public.categories (slug, name) values
  ('agriculture', 'Agriculture'),
  ('call-center', 'Call center')
on conflict (slug) do nothing;

-- Aliases for the exact texts companies typed. Lowercased, trimmed.
insert into public.category_aliases (alias, category_slug) values
  ('agriculture', 'agriculture'),
  ('landwirtschaft', 'agriculture'),
  ('poljoprivreda', 'agriculture'),
  ('farming', 'agriculture'),
  ('agrar', 'agriculture'),
  ('call centre', 'call-center'),
  ('call center', 'call-center'),
  ('callcenter', 'call-center'),
  ('kontakt center', 'call-center'),
  ('bpo', 'call-center'),
  ('it', 'it-services'),
  ('it - software', 'software-development'),
  ('it-software', 'software-development'),
  ('mobile app-entwicklung', 'software-development'),
  ('app-entwicklung', 'software-development'),
  ('app entwicklung', 'software-development'),
  ('mobile app development', 'software-development'),
  ('mobile apps', 'software-development'),
  ('school furniture', 'manufacturing'),
  ('furniture', 'manufacturing'),
  ('mobelherstellung', 'manufacturing'),
  ('anzeige', 'advertising'),
  ('werbung', 'advertising'),
  ('oglasavanje', 'advertising'),
  ('reinigung', 'cleaning'),
  ('reinigungsfirma', 'cleaning'),
  ('ciscenje', 'cleaning')
on conflict (alias) do nothing;

-- Re-run the alias backfill for rows the first pass could not place.
update public.companies c
set category_slug = a.category_slug
from public.category_aliases a
where c.category_slug is null
  and lower(trim(c.category)) = a.alias;
