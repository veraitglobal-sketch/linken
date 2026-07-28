-- Testimonial wiring: token access, provenance snapshots, source validation, partnership + scoring fields.

alter table public.testimonials
  add column if not exists author_domain text,
  add column if not exists author_domain_verified boolean not null default false,
  add column if not exists author_is_free_provider boolean not null default false,
  add column if not exists author_company_claimed boolean not null default false;

revoke all on public.testimonials from anon, authenticated;
grant select (
  id, company_id, author_company_id, body, author_name, author_role,
  source, source_id, status, consent_public, created_at, published_at,
  author_domain, author_domain_verified, author_is_free_provider, author_company_claimed
) on public.testimonials to anon, authenticated;

-- Rate limit ensure calls per confirm token (prevents row spam if a link leaks).
create table if not exists public.testimonial_confirm_ensure_limits (
  confirm_token uuid not null,
  source text not null,
  window_start timestamptz not null,
  call_count int not null default 0,
  primary key (confirm_token, source)
);

alter table public.testimonial_confirm_ensure_limits enable row level security;
revoke all on public.testimonial_confirm_ensure_limits from anon, authenticated;

create or replace function public.testimonial_ensure_rate_ok(
  p_token uuid,
  p_source text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz;
  v_count int;
begin
  insert into public.testimonial_confirm_ensure_limits (confirm_token, source, window_start, call_count)
  values (p_token, p_source, now(), 0)
  on conflict (confirm_token, source) do nothing;

  select window_start, call_count
  into v_start, v_count
  from public.testimonial_confirm_ensure_limits
  where confirm_token = p_token and source = p_source
  for update;

  if v_start is null or v_start < now() - interval '1 hour' then
    update public.testimonial_confirm_ensure_limits
    set window_start = now(), call_count = 1
    where confirm_token = p_token and source = p_source;
    return true;
  end if;

  if v_count >= 30 then
    return false;
  end if;

  update public.testimonial_confirm_ensure_limits
  set call_count = call_count + 1
  where confirm_token = p_token and source = p_source;

  return true;
end;
$$;

revoke all on function public.testimonial_ensure_rate_ok(uuid, text) from public;

create or replace function public.lock_testimonial_author_fields()
returns trigger
language plpgsql
as $$
begin
  if current_setting('app.author_testimonial_write', true) is distinct from '1' then
    if tg_op = 'UPDATE' then
      if new.body is distinct from old.body
        or new.author_name is distinct from old.author_name
        or new.author_role is distinct from old.author_role
        or new.author_domain is distinct from old.author_domain
        or new.author_domain_verified is distinct from old.author_domain_verified
        or new.author_is_free_provider is distinct from old.author_is_free_provider
        or new.author_company_claimed is distinct from old.author_company_claimed
        or new.author_email is distinct from old.author_email then
        raise exception 'testimonial author fields are immutable except via author token';
      end if;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.validate_testimonial_source_attachment(
  p_company_id uuid,
  p_source text,
  p_source_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_source_id is null then
    return;
  end if;

  if p_source = 'case_study' then
    if not exists (
      select 1
      from public.case_studies cs
      join public.case_study_client_confirmation_requests r
        on r.case_study_id = cs.id
      where cs.id = p_source_id
        and cs.company_id = p_company_id
        and r.status = 'confirmed'
    ) then
      raise exception 'Case study is not confirmed for this company';
    end if;
  elsif p_source = 'reference' then
    if not exists (
      select 1
      from public.service_references r
      where r.id = p_source_id
        and r.provider_company_id = p_company_id
        and r.status = 'confirmed'
    ) then
      raise exception 'Reference is not confirmed for this company';
    end if;
  elsif p_source = 'partnership' then
    if not exists (
      select 1
      from public.partnerships p
      where p.id = p_source_id
        and p.status = 'accepted'
        and (p.requester_id = p_company_id or p.recipient_id = p_company_id)
    ) then
      raise exception 'Partnership is not accepted for this company';
    end if;
  elsif p_source = 'standalone' then
    raise exception 'Standalone testimonials cannot have a source_id';
  else
    raise exception 'Invalid source';
  end if;
end;
$$;

revoke all on function public.validate_testimonial_source_attachment(uuid, text, uuid) from public;

create or replace function public.create_testimonial_invite(
  p_company_id uuid,
  p_source text default 'standalone',
  p_source_id uuid default null,
  p_author_email text default null,
  p_author_company_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token uuid;
begin
  if not public.is_company_owner(p_company_id) then
    raise exception 'Not authorized';
  end if;
  if p_source not in ('partnership', 'reference', 'case_study', 'standalone') then
    raise exception 'Invalid source';
  end if;

  if p_source = 'standalone' and p_source_id is not null then
    raise exception 'Standalone testimonials cannot have a source_id';
  end if;

  perform public.validate_testimonial_source_attachment(p_company_id, p_source, p_source_id);

  insert into public.testimonials (
    company_id, author_company_id, source, source_id, author_email, status
  )
  values (
    p_company_id,
    p_author_company_id,
    p_source,
    p_source_id,
    nullif(trim(p_author_email), ''),
    'pending'
  )
  returning submit_token into v_token;

  return v_token;
end;
$$;

create or replace function public.ensure_testimonial_after_confirm(
  p_token uuid,
  p_source text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_source_id uuid;
  v_author_company_id uuid;
  v_author_email text;
  v_existing uuid;
  v_new uuid;
begin
  if p_source not in ('case_study', 'reference', 'partnership') then
    raise exception 'Invalid source';
  end if;

  if p_source = 'case_study' then
    select
      r.requested_by_company_id,
      r.case_study_id,
      r.confirmed_by_company_id,
      nullif(trim(r.email), '')
    into v_company_id, v_source_id, v_author_company_id, v_author_email
    from public.case_study_client_confirmation_requests r
    where r.token = p_token
      and r.status = 'confirmed';
  elsif p_source = 'reference' then
    select
      r.provider_company_id,
      r.id,
      r.client_company_id,
      nullif(trim(r.invite_email), '')
    into v_company_id, v_source_id, v_author_company_id, v_author_email
    from public.service_references r
    where r.confirm_token = p_token
      and r.status = 'confirmed';
  else
    select
      p.requester_id,
      p.id,
      p.recipient_id,
      nullif(trim(c.invite_email), '')
    into v_company_id, v_source_id, v_author_company_id, v_author_email
    from public.partnerships p
    join public.companies c on c.id = p.recipient_id
    where p.id = p_token
      and p.status = 'accepted';
  end if;

  if v_company_id is null or v_source_id is null then
    raise exception 'Confirmation not found';
  end if;

  select submit_token into v_existing
  from public.testimonials
  where company_id = v_company_id
    and source = p_source
    and source_id = v_source_id
    and status in ('pending', 'published')
  limit 1;

  if v_existing is not null then
    return v_existing;
  end if;

  if not public.testimonial_ensure_rate_ok(p_token, p_source) then
    raise exception 'Too many requests for this link';
  end if;

  insert into public.testimonials (
    company_id, author_company_id, source, source_id, author_email, status
  )
  values (
    v_company_id, v_author_company_id, p_source, v_source_id, v_author_email, 'pending'
  )
  returning submit_token into v_new;

  return v_new;
end;
$$;

revoke all on function public.ensure_testimonial_after_confirm(uuid, text) from public;
grant execute on function public.ensure_testimonial_after_confirm(uuid, text) to anon, authenticated;

drop function if exists public.get_testimonial_by_token(uuid);

create or replace function public.get_testimonial_by_token(p_token uuid)
returns table (
  id uuid,
  status text,
  body text,
  author_name text,
  author_role text,
  company_id uuid,
  company_name text,
  company_slug text,
  author_company_id uuid,
  author_company_name text,
  author_company_slug text,
  source text,
  source_id uuid,
  consent_public boolean,
  published_at timestamptz,
  author_email text,
  author_domain text,
  author_domain_verified boolean,
  author_is_free_provider boolean,
  author_company_claimed boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    t.id,
    t.status,
    t.body,
    t.author_name,
    t.author_role,
    t.company_id,
    c.name,
    c.slug,
    t.author_company_id,
    ac.name,
    ac.slug,
    t.source,
    t.source_id,
    t.consent_public,
    t.published_at,
    t.author_email,
    t.author_domain,
    t.author_domain_verified,
    t.author_is_free_provider,
    t.author_company_claimed
  from public.testimonials t
  join public.companies c on c.id = t.company_id
  left join public.companies ac on ac.id = t.author_company_id
  where t.submit_token = p_token
    and t.status in ('pending', 'published');
$$;

drop function if exists public.submit_testimonial(uuid, text, text, text, boolean, uuid);

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
begin
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

  perform set_config('app.author_testimonial_write', '1', true);

  update public.testimonials
  set
    body = v_body,
    author_name = trim(p_author_name),
    author_role = coalesce(trim(p_author_role), ''),
    author_company_id = coalesce(p_author_company_id, row.author_company_id),
    author_email = coalesce(nullif(trim(p_author_email), ''), row.author_email),
    author_domain = case
      when v_first_publish then nullif(trim(p_author_domain), '')
      else author_domain
    end,
    author_domain_verified = case
      when v_first_publish then coalesce(p_author_domain_verified, false)
      else author_domain_verified
    end,
    author_is_free_provider = case
      when v_first_publish then coalesce(p_author_is_free_provider, false)
      else author_is_free_provider
    end,
    author_company_claimed = case
      when v_first_publish then coalesce(p_author_company_claimed, false)
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
