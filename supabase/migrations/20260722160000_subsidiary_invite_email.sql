-- Subsidiaries never got an invite_email at creation, unlike partners — so
-- resolve_claim_token could never match anything and the claim link could
-- never actually be sent, for any subsidiary, ever.

drop function if exists public.create_group_subsidiary(uuid, text, text, text, text, text, uuid, uuid, text, text[]);

create or replace function public.create_group_subsidiary(
  p_group_id uuid,
  p_name text,
  p_category text,
  p_city text,
  p_country text,
  p_slug text,
  p_claim_token uuid,
  p_parent_company_id uuid default null,
  p_website text default null,
  p_services text[] default '{}',
  p_invite_email text default null
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
  v_services text[];
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

  select coalesce(array_agg(nullif(trim(s), '')) filter (where nullif(trim(s), '') is not null), '{}')
  into v_services
  from unnest(coalesce(p_services, '{}')) as s;

  insert into public.companies (
    owner_id, claimed, claim_token, created_by_company_id,
    name, slug, category, city, country, website, tagline, description, services, verified,
    invite_email
  )
  values (
    null, false, p_claim_token, v_seed_company,
    trim(p_name), p_slug, trim(p_category), trim(p_city),
    coalesce(trim(p_country), ''),
    nullif(trim(p_website), ''),
    trim(p_category) || ' · ' || trim(p_city),
    'Branch profile created within the group. Claim this page to manage it locally.',
    v_services, false,
    nullif(lower(trim(p_invite_email)), '')
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

revoke all on function public.create_group_subsidiary(uuid, text, text, text, text, text, uuid, uuid, text, text[], text) from public;
grant execute on function public.create_group_subsidiary(uuid, text, text, text, text, text, uuid, uuid, text, text[], text) to authenticated;
