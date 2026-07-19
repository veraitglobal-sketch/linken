-- Unclaimed (ghost) company profiles — growth engine

alter table public.companies
  alter column owner_id drop not null;

alter table public.companies
  add column if not exists claimed boolean not null default true;

alter table public.companies
  add column if not exists created_by_company_id uuid references public.companies (id) on delete set null;

alter table public.companies
  add column if not exists invite_email text;

alter table public.companies
  add column if not exists claim_token uuid;

-- Backfill: every existing row with an owner is claimed
update public.companies
set claimed = true
where owner_id is not null;

-- Unique claim tokens (multiple nulls allowed for claimed firms)
create unique index if not exists companies_claim_token_uidx
  on public.companies (claim_token)
  where claim_token is not null;

alter table public.companies
  drop constraint if exists companies_claimed_owner_check;

alter table public.companies
  add constraint companies_claimed_owner_check
  check (
    (claimed = true and owner_id is not null and claim_token is null)
    or
    (claimed = false and owner_id is null and claim_token is not null)
  );

-- Replace insert policy to allow ghost profiles created by a company owner
drop policy if exists "companies_owner_insert" on public.companies;

create policy "companies_owner_insert_claimed"
on public.companies for insert
to authenticated
with check (
  claimed = true
  and owner_id = auth.uid()
);

create policy "companies_owner_insert_unclaimed"
on public.companies for insert
to authenticated
with check (
  claimed = false
  and owner_id is null
  and claim_token is not null
  and created_by_company_id is not null
  and public.is_company_owner(created_by_company_id)
);

-- Claim preview (no claim_token in result set)
create or replace function public.get_claim_preview(p_token uuid)
returns table (
  company_id uuid,
  company_name text,
  company_slug text,
  company_category text,
  company_city text,
  invite_email text,
  claimed boolean,
  inviter_id uuid,
  inviter_name text,
  inviter_slug text,
  pending_partnerships bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.name,
    c.slug,
    c.category,
    c.city,
    c.invite_email,
    c.claimed,
    inv.id,
    inv.name,
    inv.slug,
    (
      select count(*)::bigint
      from public.partnerships p
      where p.recipient_id = c.id
        and p.status = 'pending'
    ) as pending_partnerships
  from public.companies c
  left join public.companies inv on inv.id = c.created_by_company_id
  where c.claim_token = p_token;
$$;

revoke all on function public.get_claim_preview(uuid) from public;
grant execute on function public.get_claim_preview(uuid) to anon, authenticated;

-- Resolve token server-side only when invite email matches (never expose via public UI)
create or replace function public.resolve_claim_token(p_slug text, p_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.claim_token
  from public.companies c
  where c.slug = p_slug
    and c.claimed = false
    and c.claim_token is not null
    and c.invite_email is not null
    and lower(c.invite_email) = lower(trim(p_email));
$$;

revoke all on function public.resolve_claim_token(text, text) from public;
grant execute on function public.resolve_claim_token(text, text) to anon, authenticated;

-- Claim: one user → one company; partnerships stay pending
create or replace function public.claim_company(p_token uuid)
returns public.companies
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  row public.companies;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if exists (
    select 1 from public.companies c
    where c.owner_id = uid and c.claimed = true
  ) then
    raise exception 'Account already owns a company';
  end if;

  update public.companies c
  set
    owner_id = uid,
    claimed = true,
    claim_token = null,
    updated_at = now()
  where c.claim_token = p_token
    and c.claimed = false
  returning * into row;

  if row.id is null then
    raise exception 'Invalid or already claimed';
  end if;

  return row;
end;
$$;

revoke all on function public.claim_company(uuid) from public;
grant execute on function public.claim_company(uuid) to authenticated;
