-- "Client" is a relationship role on the provider's file, not a company sector.
update public.companies
set
  category_slug = case
    when lower(trim(category)) = 'client' then null
    else category_slug
  end,
  category = case
    when lower(trim(category)) = 'client' then ''
    else category
  end,
  tagline = case
    when tagline ~* '^client of[[:space:]]' then ''
    else tagline
  end,
  description = case
    when description like 'Draft profile created from a service reference by %' then ''
    else description
  end
where
  lower(trim(category)) = 'client'
  or tagline ~* '^client of[[:space:]]'
  or description like 'Draft profile created from a service reference by %';
