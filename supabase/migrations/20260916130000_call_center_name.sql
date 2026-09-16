-- Public name is Call center. Keep British spelling only as an alias.
insert into public.categories (slug, name) values
  ('call-center', 'Call center')
on conflict (slug) do update set name = excluded.name;

update public.category_aliases
set category_slug = 'call-center'
where category_slug = 'call-centre';

update public.companies
set category_slug = 'call-center'
where category_slug = 'call-centre';

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'company_rank'
  ) then
    update public.company_rank
    set category_slug = 'call-center'
    where category_slug = 'call-centre';
  end if;
end $$;

insert into public.category_aliases (alias, category_slug) values
  ('call center', 'call-center'),
  ('call centre', 'call-center'),
  ('call-center', 'call-center'),
  ('call-centre', 'call-center'),
  ('callcenter', 'call-center'),
  ('kontakt center', 'call-center'),
  ('contact center', 'call-center'),
  ('contact centre', 'call-center'),
  ('bpo', 'call-center')
on conflict (alias) do update set category_slug = excluded.category_slug;

delete from public.categories where slug = 'call-centre';
