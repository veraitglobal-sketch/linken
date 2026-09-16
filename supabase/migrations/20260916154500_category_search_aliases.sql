-- Everyday search spellings for Sector field (SR/EN).
insert into public.category_aliases (alias, category_slug) values
  ('call centar', 'call-center'),
  ('callcentar', 'call-center'),
  ('kontakt centar', 'call-center'),
  ('it software', 'software-development'),
  ('it softver', 'software-development'),
  ('softver', 'software-development')
on conflict (alias) do nothing;
