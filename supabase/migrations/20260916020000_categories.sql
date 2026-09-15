-- Canonical categories + ISO country_code. Ranking needs both.
-- Backfill is exact name / alias only. Unmatched stay null.

create table public.categories (
  slug text primary key,
  name text not null,
  parent_slug text references public.categories(slug),
  created_at timestamptz not null default now()
);

create table public.category_aliases (
  alias text primary key,
  category_slug text not null references public.categories(slug) on delete cascade
);

create table public.category_unmatched (
  text_key text primary key,
  sample text not null,
  hit_count int not null default 1,
  last_seen_at timestamptz not null default now()
);

alter table public.companies
  add column if not exists category_slug text references public.categories(slug),
  add column if not exists country_code text;

create index if not exists companies_category_country_idx
  on public.companies (category_slug, country_code);

alter table public.categories enable row level security;
alter table public.category_aliases enable row level security;
alter table public.category_unmatched enable row level security;

create policy categories_public_select
  on public.categories for select to anon, authenticated using (true);
create policy category_aliases_public_select
  on public.category_aliases for select to anon, authenticated using (true);

revoke all on public.category_unmatched from anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.category_aliases to anon, authenticated;

insert into public.categories (slug, name) values
  ('architecture', 'Architecture'),
  ('interior-design', 'Interior design'),
  ('landscape-architecture', 'Landscape architecture'),
  ('urban-planning', 'Urban planning'),
  ('engineering', 'Engineering'),
  ('civil-engineering', 'Civil engineering'),
  ('structural-engineering', 'Structural engineering'),
  ('mechanical-electrical', 'Mechanical and electrical'),
  ('construction', 'Construction'),
  ('specialist-contractors', 'Specialist contractors'),
  ('electrical-contractors', 'Electrical contractors'),
  ('plumbing-hvac', 'Plumbing and HVAC'),
  ('roofing', 'Roofing'),
  ('scaffolding', 'Scaffolding'),
  ('steel-fabrication', 'Steel fabrication'),
  ('glazing', 'Glazing'),
  ('painting-finishing', 'Painting and finishing'),
  ('flooring', 'Flooring'),
  ('demolition', 'Demolition'),
  ('facility-management', 'Facility management'),
  ('cleaning', 'Cleaning'),
  ('security-services', 'Security services'),
  ('waste-management', 'Waste management'),
  ('software-development', 'Software development'),
  ('it-services', 'IT services'),
  ('digital-agencies', 'Digital agencies'),
  ('design-studios', 'Design studios'),
  ('advertising', 'Advertising'),
  ('consulting', 'Consulting'),
  ('legal', 'Legal'),
  ('accounting', 'Accounting'),
  ('logistics', 'Logistics'),
  ('freight', 'Freight'),
  ('manufacturing', 'Manufacturing'),
  ('real-estate', 'Real estate'),
  ('property-development', 'Property development'),
  ('energy', 'Energy'),
  ('telecommunications', 'Telecommunications'),
  ('healthcare', 'Healthcare'),
  ('hospitality', 'Hospitality')
on conflict (slug) do nothing;

insert into public.category_aliases (alias, category_slug)
select lower(name), slug from public.categories
on conflict (alias) do nothing;

insert into public.category_aliases (alias, category_slug) values
  ('architekt', 'architecture'),
  ('architekturburo', 'architecture'),
  ('architekturbüro', 'architecture'),
  ('architektur', 'architecture'),
  ('arhitektura', 'architecture'),
  ('architect', 'architecture'),
  ('architects', 'architecture'),
  ('architecture firm', 'architecture'),
  ('architecture office', 'architecture'),
  ('innenarchitektur', 'interior-design'),
  ('interior architecture', 'interior-design'),
  ('landschaftsarchitektur', 'landscape-architecture'),
  ('städtebau', 'urban-planning'),
  ('stadtebau', 'urban-planning'),
  ('urbanizam', 'urban-planning'),
  ('ingenieur', 'engineering'),
  ('ingenieurbüro', 'engineering'),
  ('ingenieurburo', 'engineering'),
  ('inženjering', 'engineering'),
  ('inzenjering', 'engineering'),
  ('tiefbau', 'civil-engineering'),
  ('hochbau', 'construction'),
  ('tragwerksplanung', 'structural-engineering'),
  ('tga', 'mechanical-electrical'),
  ('mep', 'mechanical-electrical'),
  ('bau', 'construction'),
  ('baufirma', 'construction'),
  ('bauunternehmen', 'construction'),
  ('građevina', 'construction'),
  ('gradevina', 'construction'),
  ('construction company', 'construction'),
  ('contractor', 'specialist-contractors'),
  ('subcontractors', 'specialist-contractors'),
  ('specialist contractor', 'specialist-contractors'),
  ('ausbau', 'specialist-contractors'),
  ('elektriker', 'electrical-contractors'),
  ('elektro', 'electrical-contractors'),
  ('sanitär', 'plumbing-hvac'),
  ('sanitar', 'plumbing-hvac'),
  ('heizung', 'plumbing-hvac'),
  ('klima', 'plumbing-hvac'),
  ('dachdecker', 'roofing'),
  ('gerüstbau', 'scaffolding'),
  ('gerustbau', 'scaffolding'),
  ('stahlbau', 'steel-fabrication'),
  ('glaserei', 'glazing'),
  ('maler', 'painting-finishing'),
  ('bodenleger', 'flooring'),
  ('abbruch', 'demolition'),
  ('gebäudemanagement', 'facility-management'),
  ('gebaudemanagement', 'facility-management'),
  ('facility services', 'facility-management'),
  ('reinigung', 'cleaning'),
  ('gebäudereinigung', 'cleaning'),
  ('gebaudereinigung', 'cleaning'),
  ('cleaning company', 'cleaning'),
  ('čišćenje', 'cleaning'),
  ('ciscenje', 'cleaning'),
  ('sicherheit', 'security-services'),
  ('obezbeđenje', 'security-services'),
  ('obezbedenje', 'security-services'),
  ('entsorgung', 'waste-management'),
  ('software', 'software-development'),
  ('it - software', 'software-development'),
  ('it-software', 'software-development'),
  ('softwareentwicklung', 'software-development'),
  ('programiranje', 'software-development'),
  ('software company', 'software-development'),
  ('edv', 'it-services'),
  ('it dienstleister', 'it-services'),
  ('it services', 'it-services'),
  ('agentur', 'digital-agencies'),
  ('digital agency', 'digital-agencies'),
  ('werbeagentur', 'advertising'),
  ('studio', 'design-studios'),
  ('design studio', 'design-studios'),
  ('beratung', 'consulting'),
  ('unternehmensberatung', 'consulting'),
  ('konsultant', 'consulting'),
  ('management consulting', 'consulting'),
  ('rechtsanwalt', 'legal'),
  ('anwalt', 'legal'),
  ('advokat', 'legal'),
  ('steuerberatung', 'accounting'),
  ('buchhaltung', 'accounting'),
  ('računovodstvo', 'accounting'),
  ('racunovodstvo', 'accounting'),
  ('spedition', 'logistics'),
  ('špedicija', 'logistics'),
  ('spedicija', 'logistics'),
  ('logistik', 'logistics'),
  ('spediteur', 'freight'),
  ('produktion', 'manufacturing'),
  ('proizvodnja', 'manufacturing'),
  ('immobilien', 'real-estate'),
  ('nekretnine', 'real-estate'),
  ('projektentwicklung', 'property-development'),
  ('real estate development', 'property-development'),
  ('energie', 'energy'),
  ('telekom', 'telecommunications'),
  ('gesundheit', 'healthcare'),
  ('zdravstvo', 'healthcare'),
  ('hotel', 'hospitality'),
  ('gastronomie', 'hospitality'),
  ('ugostiteljstvo', 'hospitality')
on conflict (alias) do nothing;

update public.companies c
set category_slug = a.category_slug
from public.category_aliases a
where c.category_slug is null
  and lower(trim(c.category)) = a.alias;

update public.companies c
set country_code = v.code
from (values
  ('DE', 'germany'), ('DE', 'deutschland'), ('DE', 'de'),
  ('AT', 'austria'), ('AT', 'österreich'), ('AT', 'osterreich'),
  ('CH', 'switzerland'), ('CH', 'schweiz'),
  ('RS', 'serbia'), ('RS', 'srbija'), ('RS', 'rs'),
  ('HR', 'croatia'), ('HR', 'hrvatska'),
  ('BA', 'bosnia and herzegovina'), ('BA', 'bosnia'),
  ('SI', 'slovenia'), ('SI', 'slovenija'),
  ('IT', 'italy'), ('IT', 'italia'),
  ('FR', 'france'),
  ('NL', 'netherlands'), ('NL', 'holland'),
  ('GB', 'united kingdom'), ('GB', 'uk'), ('GB', 'england'),
  ('US', 'united states'), ('US', 'usa'),
  ('PL', 'poland'), ('PL', 'polska'),
  ('ES', 'spain'), ('ES', 'españa'),
  ('BE', 'belgium'),
  ('CZ', 'czechia'), ('CZ', 'czech republic')
) as v(code, key)
where c.country_code is null
  and lower(trim(c.country)) = v.key;

insert into public.category_unmatched (text_key, sample, hit_count)
select lower(trim(category)), min(category), count(*)::int
from public.companies
where category_slug is null
  and trim(coalesce(category, '')) <> ''
group by lower(trim(category))
on conflict (text_key) do nothing;

create or replace function public.record_category_unmatched(p_text text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sample text := trim(p_text);
  v_key text;
begin
  if v_sample is null or v_sample = '' then
    return;
  end if;
  v_key := lower(left(v_sample, 80));
  insert into public.category_unmatched (text_key, sample, hit_count, last_seen_at)
  values (v_key, left(v_sample, 80), 1, now())
  on conflict (text_key) do update
    set hit_count = public.category_unmatched.hit_count + 1,
        last_seen_at = now();
end;
$$;

revoke all on function public.record_category_unmatched(text) from public;
grant execute on function public.record_category_unmatched(text) to service_role;
