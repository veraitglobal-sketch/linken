-- Availability status for public profiles / one-pager

alter table public.companies
  add column if not exists accepting_clients boolean not null default true;

grant select (accepting_clients) on public.companies to anon, authenticated;
