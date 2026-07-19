-- Auto-fetched logos vs manual uploads; refresh rate limit; subsidiary website

alter table public.companies
  add column if not exists logo_source text;

alter table public.companies
  drop constraint if exists companies_logo_source_check;

alter table public.companies
  add constraint companies_logo_source_check
  check (logo_source is null or logo_source in ('auto', 'manual'));

alter table public.companies
  add column if not exists logo_refresh_window_start timestamptz;

alter table public.companies
  add column if not exists logo_refresh_count int not null default 0;

-- Public column grant (logo_refresh_* stay private — no grant)
grant select (logo_source) on public.companies to anon, authenticated;

-- Owner-only rate limit: max 3 logo refreshes per calendar day
create or replace function public.record_logo_refresh_attempt(p_company_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz;
  v_count int;
begin
  if auth.uid() is null or not public.is_company_owner(p_company_id) then
    raise exception 'Not allowed';
  end if;

  select logo_refresh_window_start, logo_refresh_count
  into v_start, v_count
  from public.companies
  where id = p_company_id
  for update;

  if not found then
    raise exception 'Company not found';
  end if;

  if v_start is null or v_start < date_trunc('day', now()) then
    update public.companies
    set logo_refresh_window_start = now(),
        logo_refresh_count = 1
    where id = p_company_id;
    return true;
  end if;

  if v_count >= 3 then
    return false;
  end if;

  update public.companies
  set logo_refresh_count = logo_refresh_count + 1
  where id = p_company_id;

  return true;
end;
$$;

revoke all on function public.record_logo_refresh_attempt(uuid) from public;
grant execute on function public.record_logo_refresh_attempt(uuid) to authenticated;

-- Subsidiary create: optional website for auto-logo
drop function if exists public.create_group_subsidiary(uuid, text, text, text, text, text, uuid, uuid);

create or replace function public.create_group_subsidiary(
  p_group_id uuid,
  p_name text,
  p_category text,
  p_city text,
  p_country text,
  p_slug text,
  p_claim_token uuid,
  p_parent_company_id uuid default null,
  p_website text default null
)
returns table (
  company_id uuid,
  company_slug text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid;
  v_seed_company uuid;
  v_company_id uuid;
  v_allowed boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select created_by into v_creator
  from public.company_groups
  where id = p_group_id;

  if v_creator is null then
    raise exception 'Group not found';
  end if;

  if v_creator = auth.uid() then
    v_allowed := true;
  end if;

  if p_parent_company_id is not null
     and public.is_company_owner(p_parent_company_id) then
    if exists (
      select 1 from public.company_group_members m
      where m.group_id = p_group_id
        and m.company_id = p_parent_company_id
        and m.status = 'confirmed'
    ) then
      v_allowed := true;
    end if;
  end if;

  if not v_allowed then
    raise exception 'Not allowed to create a subsidiary here';
  end if;

  if coalesce(trim(p_name), '') = ''
     or coalesce(trim(p_category), '') = ''
     or coalesce(trim(p_city), '') = '' then
    raise exception 'Name, category, and city are required';
  end if;

  if p_parent_company_id is not null then
    if not exists (
      select 1 from public.company_group_members m
      where m.group_id = p_group_id
        and m.company_id = p_parent_company_id
        and m.status = 'confirmed'
    ) then
      raise exception 'Parent must be a confirmed member of the same group';
    end if;
  end if;

  select c.id into v_seed_company
  from public.companies c
  where c.owner_id = auth.uid()
    and c.claimed = true
  order by c.created_at asc
  limit 1;

  if p_parent_company_id is not null then
    v_seed_company := coalesce(p_parent_company_id, v_seed_company);
  end if;

  insert into public.companies (
    owner_id, claimed, claim_token, created_by_company_id,
    name, slug, category, city, country, website, tagline, description, services, verified
  )
  values (
    null, false, p_claim_token, v_seed_company,
    trim(p_name), p_slug, trim(p_category), trim(p_city),
    coalesce(trim(p_country), ''),
    nullif(trim(p_website), ''),
    trim(p_category) || ' · ' || trim(p_city),
    'Branch profile created within the group. Claim this page to manage it locally.',
    '{}', false
  )
  returning id into v_company_id;

  insert into public.company_group_members (
    group_id, company_id, status, confirmed_at, parent_company_id
  )
  values (
    p_group_id, v_company_id, 'confirmed', now(), p_parent_company_id
  );

  return query select v_company_id, p_slug;
end;
$$;

revoke all on function public.create_group_subsidiary(uuid, text, text, text, text, text, uuid, uuid, text) from public;
grant execute on function public.create_group_subsidiary(uuid, text, text, text, text, text, uuid, uuid, text) to authenticated;
