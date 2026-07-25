-- Allow owners to remove an auto-fetched favicon without re-fetch.
-- App uses logo_source = 'cleared' (logo_url null) until restore or manual upload.

alter table public.companies
  drop constraint if exists companies_logo_source_check;

alter table public.companies
  add constraint companies_logo_source_check
  check (
    logo_source is null
    or logo_source in ('auto', 'manual', 'cleared')
  );
