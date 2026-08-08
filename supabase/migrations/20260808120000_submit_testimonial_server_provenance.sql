-- submit_testimonial: never trust client provenance flags.
-- Compute domain / free-provider / verified / claimed inside the RPC from
-- invite email + company rows. Keep signature for app compatibility; ignore
-- p_author_domain / verified / free / claimed parameters.

create or replace function public.testimonial_email_domain(p_email text)
returns text
language sql
immutable
as $$
  select nullif(lower(split_part(trim(p_email), '@', 2)), '');
$$;

create or replace function public.testimonial_is_public_email_domain(p_domain text)
returns boolean
language plpgsql
immutable
as $$
declare
  d text := lower(trim(coalesce(p_domain, '')));
begin
  if d = '' then
    return true;
  end if;
  if d in (
    'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.de', 'yahoo.co.uk',
    'yahoo.fr', 'hotmail.com', 'hotmail.de', 'outlook.com', 'outlook.de',
    'live.com', 'msn.com', 'web.de', 'gmx.de', 'gmx.net', 'gmx.com',
    'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me',
    'protonmail.com', 'pm.me', 'mail.com', 'yandex.com', 'yandex.ru',
    'zoho.com', 'tutanota.com', 'fastmail.com'
  ) then
    return true;
  end if;
  if d like 'yahoo.%' or d like 'gmx.%' or d like 'hotmail.%' or d like 'outlook.%' then
    return true;
  end if;
  return false;
end;
$$;

create or replace function public.testimonial_website_host(p_website text)
returns text
language plpgsql
immutable
as $$
declare
  host text := lower(trim(coalesce(p_website, '')));
begin
  if host = '' then
    return null;
  end if;
  host := regexp_replace(host, '^https?://', '');
  host := split_part(host, '/', 1);
  host := split_part(host, '?', 1);
  host := split_part(host, '#', 1);
  host := regexp_replace(host, ':\d+$', '');
  host := rtrim(host, '.');
  if host like 'www.%' then
    host := substring(host from 5);
  end if;
  if host = '' or host = 'localhost' or host ~ '^\d+\.\d+\.\d+\.\d+$' then
    return null;
  end if;
  return host;
end;
$$;

create or replace function public.submit_testimonial(
  p_token uuid,
  p_body text,
  p_author_name text,
  p_author_role text,
  p_consent_public boolean,
  p_author_company_id uuid default null,
  p_author_email text default null,
  p_author_domain text default null,
  p_author_domain_verified boolean default false,
  p_author_is_free_provider boolean default false,
  p_author_company_claimed boolean default false
)
returns public.testimonials
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.testimonials;
  v_body text := trim(p_body);
  v_first_publish boolean;
  v_email text;
  v_domain text;
  v_company_id uuid;
  v_website text;
  v_verified boolean := false;
  v_claimed boolean := false;
  v_free boolean := true;
  v_domain_verified boolean := false;
  v_site_host text;
  v_jwt_email text;
begin
  -- Client provenance args (p_author_domain / verified / free / claimed) are
  -- intentionally ignored — values are computed below from invite + company.

  if length(v_body) < 1 then
    raise exception 'Testimonial text is required';
  end if;
  if length(trim(p_author_name)) < 1 then
    raise exception 'Author name is required';
  end if;
  if p_consent_public is not true then
    raise exception 'Public display consent is required';
  end if;

  select * into row from public.testimonials where submit_token = p_token;
  if not found then
    raise exception 'Invalid token';
  end if;
  if row.status = 'withdrawn' then
    raise exception 'Testimonial withdrawn';
  end if;

  v_first_publish := row.published_at is null;

  -- Email: invite row first, then JWT; never accept a forged alternate email.
  v_jwt_email := nullif(lower(trim(auth.jwt() ->> 'email')), '');
  v_email := coalesce(
    nullif(lower(trim(row.author_email)), ''),
    v_jwt_email
  );
  if p_author_email is not null
     and nullif(lower(trim(p_author_email)), '') is not null
     and v_email is not null
     and lower(trim(p_author_email)) <> v_email
  then
    raise exception 'Author email does not match invite';
  end if;

  -- Company link: lock invite company; otherwise optional existing company id.
  v_company_id := row.author_company_id;
  if v_company_id is null and p_author_company_id is not null then
    if exists (select 1 from public.companies c where c.id = p_author_company_id) then
      v_company_id := p_author_company_id;
    end if;
  elsif v_company_id is not null
        and p_author_company_id is not null
        and p_author_company_id <> v_company_id
  then
    raise exception 'Author company cannot be changed';
  end if;

  v_domain := public.testimonial_email_domain(v_email);
  v_free := public.testimonial_is_public_email_domain(v_domain);

  if v_company_id is not null then
    select c.website, coalesce(c.verified, false),
           (coalesce(c.claimed, false) and c.owner_id is not null)
    into v_website, v_verified, v_claimed
    from public.companies c
    where c.id = v_company_id;
  end if;

  v_site_host := public.testimonial_website_host(v_website);
  if v_first_publish then
    v_domain_verified :=
      v_domain is not null
      and not v_free
      and v_verified
      and v_site_host is not null
      and (
        v_domain = v_site_host
        or v_site_host like '%.' || v_domain
      );
  else
    v_domain := row.author_domain;
    v_domain_verified := row.author_domain_verified;
    v_free := row.author_is_free_provider;
    v_claimed := row.author_company_claimed;
  end if;

  perform set_config('app.author_testimonial_write', '1', true);

  update public.testimonials
  set
    body = v_body,
    author_name = trim(p_author_name),
    author_role = coalesce(trim(p_author_role), ''),
    author_company_id = v_company_id,
    author_email = coalesce(v_email, author_email),
    author_domain = case when v_first_publish then v_domain else author_domain end,
    author_domain_verified = case
      when v_first_publish then v_domain_verified
      else author_domain_verified
    end,
    author_is_free_provider = case
      when v_first_publish then v_free
      else author_is_free_provider
    end,
    author_company_claimed = case
      when v_first_publish then coalesce(v_claimed, false)
      else author_company_claimed
    end,
    consent_public = true,
    status = 'published',
    published_at = coalesce(published_at, now())
  where id = row.id
  returning * into row;

  return row;
end;
$$;

revoke all on function public.submit_testimonial(uuid, text, text, text, boolean, uuid, text, text, boolean, boolean, boolean)
  from public;
grant execute on function public.submit_testimonial(uuid, text, text, text, boolean, uuid, text, text, boolean, boolean, boolean)
  to anon, authenticated;

revoke all on function public.testimonial_email_domain(text) from public;
revoke all on function public.testimonial_is_public_email_domain(text) from public;
revoke all on function public.testimonial_website_host(text) from public;
