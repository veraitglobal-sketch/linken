-- Client-written testimonials — immutable text for the receiving company.

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  author_company_id uuid references public.companies (id) on delete set null,
  body text not null default '',
  author_name text not null default '',
  author_role text not null default '',
  source text not null default 'standalone'
    check (source in ('partnership', 'reference', 'case_study', 'standalone')),
  source_id uuid,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'withdrawn')),
  consent_public boolean not null default false,
  submit_token uuid not null unique default gen_random_uuid(),
  author_email text,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  constraint testimonials_body_when_published
    check (status <> 'published' or length(trim(body)) > 0),
  constraint testimonials_consent_when_published
    check (status <> 'published' or consent_public = true)
);

create index testimonials_company_status_idx
  on public.testimonials (company_id, status);

create unique index testimonials_one_published_per_source
  on public.testimonials (company_id, source, source_id)
  where status = 'published' and source_id is not null;

alter table public.testimonials enable row level security;

create policy "testimonials_public_read_published"
on public.testimonials for select
using (status = 'published' and consent_public = true);

revoke all on public.testimonials from anon, authenticated;
grant select (
  id, company_id, author_company_id, body, author_name, author_role,
  source, source_id, status, consent_public, created_at, published_at
) on public.testimonials to anon, authenticated;

-- Receiving company cannot rewrite author text (only token RPCs with app flag).
create or replace function public.lock_testimonial_author_fields()
returns trigger
language plpgsql
as $$
begin
  if current_setting('app.author_testimonial_write', true) is distinct from '1' then
    if tg_op = 'UPDATE' then
      if new.body is distinct from old.body
        or new.author_name is distinct from old.author_name
        or new.author_role is distinct from old.author_role then
        raise exception 'testimonial author text is immutable except via author token';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists testimonials_lock_author_fields on public.testimonials;
create trigger testimonials_lock_author_fields
  before update on public.testimonials
  for each row execute function public.lock_testimonial_author_fields();

-- Owner: create a pending invite (standalone or attached to a confirmation).
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

revoke all on function public.create_testimonial_invite(uuid, text, uuid, text, uuid)
  from public;
grant execute on function public.create_testimonial_invite(uuid, text, uuid, text, uuid)
  to authenticated;

-- Author form preview (token is bearer credential).
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
  published_at timestamptz
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
    t.published_at
  from public.testimonials t
  join public.companies c on c.id = t.company_id
  left join public.companies ac on ac.id = t.author_company_id
  where t.submit_token = p_token
    and t.status in ('pending', 'published');
$$;

revoke all on function public.get_testimonial_by_token(uuid) from public;
grant execute on function public.get_testimonial_by_token(uuid) to anon, authenticated;

-- Author submit or update (never callable by receiving company for someone else's words).
create or replace function public.submit_testimonial(
  p_token uuid,
  p_body text,
  p_author_name text,
  p_author_role text,
  p_consent_public boolean,
  p_author_company_id uuid default null
)
returns public.testimonials
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.testimonials;
  v_body text := trim(p_body);
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

  perform set_config('app.author_testimonial_write', '1', true);

  update public.testimonials
  set
    body = v_body,
    author_name = trim(p_author_name),
    author_role = coalesce(trim(p_author_role), ''),
    author_company_id = coalesce(p_author_company_id, row.author_company_id),
    consent_public = true,
    status = 'published',
    published_at = coalesce(published_at, now())
  where id = row.id
  returning * into row;

  return row;
end;
$$;

revoke all on function public.submit_testimonial(uuid, text, text, text, boolean, uuid)
  from public;
grant execute on function public.submit_testimonial(uuid, text, text, text, boolean, uuid)
  to anon, authenticated;

create or replace function public.withdraw_testimonial(p_token uuid)
returns public.testimonials
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.testimonials;
begin
  select * into row from public.testimonials where submit_token = p_token;
  if not found then
    raise exception 'Invalid token';
  end if;

  update public.testimonials
  set status = 'withdrawn', consent_public = false
  where id = row.id
  returning * into row;

  return row;
end;
$$;

revoke all on function public.withdraw_testimonial(uuid) from public;
grant execute on function public.withdraw_testimonial(uuid) to anon, authenticated;
