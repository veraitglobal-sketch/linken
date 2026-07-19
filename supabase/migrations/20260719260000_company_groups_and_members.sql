-- Company groups (orgs with subsidiaries) + team members

-- ─── Tables ───────────────────────────────────────────────────────────────

create table public.company_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  website text not null default '',
  logo_url text,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.company_group_members (
  group_id uuid not null references public.company_groups (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined')),
  invited_at timestamptz not null default now(),
  confirmed_at timestamptz,
  primary key (group_id, company_id)
);

create index company_group_members_company_idx
  on public.company_group_members (company_id);

create index company_group_members_status_idx
  on public.company_group_members (group_id, status);

create table public.company_members (
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create index company_members_user_idx
  on public.company_members (user_id);

-- Backfill: claimed firms → owner membership
insert into public.company_members (company_id, user_id, role)
select c.id, c.owner_id, 'owner'
from public.companies c
where c.claimed = true
  and c.owner_id is not null
on conflict do nothing;

-- Keep owner row in sync when a company is claimed / ownership set
create or replace function public.ensure_company_owner_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.claimed = true and new.owner_id is not null then
    insert into public.company_members (company_id, user_id, role)
    values (new.id, new.owner_id, 'owner')
    on conflict (company_id, user_id) do update
      set role = 'owner';
  end if;
  return new;
end;
$$;

drop trigger if exists companies_ensure_owner_member on public.companies;
create trigger companies_ensure_owner_member
  after insert or update of owner_id, claimed
  on public.companies
  for each row
  execute function public.ensure_company_owner_member();

-- ─── Helpers ──────────────────────────────────────────────────────────────

create or replace function public.is_company_member(company uuid, min_role text default 'member')
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members m
    where m.company_id = company
      and m.user_id = auth.uid()
      and (
        case lower(coalesce(min_role, 'member'))
          when 'owner' then m.role = 'owner'
          when 'admin' then m.role in ('owner', 'admin')
          else m.role in ('owner', 'admin', 'member')
        end
      )
  );
$$;

revoke all on function public.is_company_member(uuid, text) from public;
grant execute on function public.is_company_member(uuid, text) to authenticated;

-- ─── RLS: company_groups ─────────────────────────────────────────────────

alter table public.company_groups enable row level security;

create policy "company_groups_public_select"
on public.company_groups for select
to anon, authenticated
using (true);

create policy "company_groups_creator_insert"
on public.company_groups for insert
to authenticated
with check (created_by = auth.uid());

create policy "company_groups_creator_update"
on public.company_groups for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

grant select, insert, update on public.company_groups to authenticated;
grant select on public.company_groups to anon;

-- ─── RLS: company_group_members ──────────────────────────────────────────

alter table public.company_group_members enable row level security;

-- Public: confirmed only
create policy "company_group_members_public_confirmed"
on public.company_group_members for select
to anon, authenticated
using (status = 'confirmed');

-- Creator of group: see all statuses for their groups
create policy "company_group_members_creator_select"
on public.company_group_members for select
to authenticated
using (
  exists (
    select 1 from public.company_groups g
    where g.id = group_id and g.created_by = auth.uid()
  )
);

-- Company owner: see pending/declined for their firm
create policy "company_group_members_company_owner_select"
on public.company_group_members for select
to authenticated
using (public.is_company_owner(company_id));

-- Insert: only group creator, and only as pending.
-- Auto-confirmed subsidiaries go through create_group_subsidiary (security definer).
create policy "company_group_members_creator_insert"
on public.company_group_members for insert
to authenticated
with check (
  status = 'pending'
  and exists (
    select 1 from public.company_groups g
    where g.id = group_id and g.created_by = auth.uid()
  )
);

grant select, insert on public.company_group_members to authenticated;
grant select on public.company_group_members to anon;

-- Status transitions via security definer only (no direct update grant for status)
-- Creators may need update for nothing — respond is RPC. No update grant.

-- ─── RLS: company_members ────────────────────────────────────────────────

alter table public.company_members enable row level security;

create policy "company_members_member_select"
on public.company_members for select
to authenticated
using (public.is_company_member(company_id, 'member'));

create policy "company_members_owner_insert"
on public.company_members for insert
to authenticated
with check (
  public.is_company_owner(company_id)
  and role in ('admin', 'member')
);

create policy "company_members_owner_delete"
on public.company_members for delete
to authenticated
using (
  public.is_company_owner(company_id)
  and role <> 'owner'
);

grant select, insert, delete on public.company_members to authenticated;

-- ─── RPC: respond_group_membership ───────────────────────────────────────

create or replace function public.respond_group_membership(
  p_group_id uuid,
  p_company_id uuid,
  p_decision text
)
returns public.company_group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.company_group_members;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_decision not in ('confirmed', 'declined') then
    raise exception 'Invalid decision';
  end if;

  -- Only the COMPANY owner may accept/decline — never the group creator alone
  if not public.is_company_owner(p_company_id) then
    raise exception 'Only the company owner can respond to a group invite';
  end if;

  update public.company_group_members
  set
    status = p_decision,
    confirmed_at = case when p_decision = 'confirmed' then now() else null end
  where group_id = p_group_id
    and company_id = p_company_id
    and status = 'pending'
  returning * into v_row;

  if v_row.company_id is null then
    raise exception 'No pending membership found';
  end if;

  return v_row;
end;
$$;

revoke all on function public.respond_group_membership(uuid, uuid, text) from public;
grant execute on function public.respond_group_membership(uuid, uuid, text) to authenticated;

-- ─── RPC: create_group_subsidiary (auto-confirmed membership) ────────────

create or replace function public.create_group_subsidiary(
  p_group_id uuid,
  p_name text,
  p_category text,
  p_city text,
  p_country text,
  p_slug text,
  p_claim_token uuid
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
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select created_by into v_creator
  from public.company_groups
  where id = p_group_id;

  if v_creator is null or v_creator <> auth.uid() then
    raise exception 'Only the group creator can add a subsidiary';
  end if;

  if coalesce(trim(p_name), '') = ''
     or coalesce(trim(p_category), '') = ''
     or coalesce(trim(p_city), '') = '' then
    raise exception 'Name, category, and city are required';
  end if;

  -- Prefer creator's owned firm as created_by_company_id (audit trail)
  select c.id into v_seed_company
  from public.companies c
  where c.owner_id = auth.uid()
    and c.claimed = true
  order by c.created_at asc
  limit 1;

  insert into public.companies (
    owner_id,
    claimed,
    claim_token,
    created_by_company_id,
    name,
    slug,
    category,
    city,
    country,
    tagline,
    description,
    services,
    verified
  )
  values (
    null,
    false,
    p_claim_token,
    v_seed_company,
    trim(p_name),
    p_slug,
    trim(p_category),
    trim(p_city),
    coalesce(trim(p_country), ''),
    trim(p_category) || ' · ' || trim(p_city),
    'Branch profile created by the group. Claim this page to manage it locally.',
    '{}',
    false
  )
  returning id into v_company_id;

  -- Auto-confirmed: group's own structure statement (no other party to deceive)
  insert into public.company_group_members (
    group_id, company_id, status, confirmed_at
  )
  values (
    p_group_id, v_company_id, 'confirmed', now()
  );

  return query select v_company_id, p_slug;
end;
$$;

revoke all on function public.create_group_subsidiary(uuid, text, text, text, text, text, uuid) from public;
grant execute on function public.create_group_subsidiary(uuid, text, text, text, text, text, uuid) to authenticated;

-- Lookup auth user by email — service_role only (team invites)
create or replace function public.lookup_user_id_by_email(p_email text)
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select id
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;
$$;

revoke all on function public.lookup_user_id_by_email(text) from public;
grant execute on function public.lookup_user_id_by_email(text) to service_role;
