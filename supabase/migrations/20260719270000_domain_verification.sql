-- Domain verification (Search Console model)
--
-- Design choice: sensitive verification state lives in company_verifications
-- with NO client write policies. companies.verified stays as a denormalized
-- public flag, updated ONLY by security definer functions below.
-- A BEFORE UPDATE trigger on companies rejects client attempts to flip verified.

create table public.company_verifications (
  company_id uuid primary key references public.companies (id) on delete cascade,
  verification_method text
    check (verification_method in ('email_domain', 'dns_txt', 'meta_tag')),
  verified_at timestamptz,
  verify_token uuid not null default gen_random_uuid(),
  website_linked boolean not null default false,
  website_linked_at timestamptz,
  last_verification_check timestamptz,
  -- Rate limit: max 5 checks / hour per company (window starts on first check)
  check_window_start timestamptz,
  check_count int not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.company_verifications is
  'Domain verification state. No client UPDATE/INSERT grants — only security definer RPCs. TODO cron: re-check DNS/meta after 90 days; on failure call set_domain_unverified + email warning.';

alter table public.company_verifications enable row level security;

-- Public read of non-secret columns (verify_token excluded via column grants)
create policy "company_verifications_public_select"
on public.company_verifications for select
to anon, authenticated
using (true);

revoke all on public.company_verifications from anon, authenticated;
grant select (
  company_id,
  verification_method,
  verified_at,
  website_linked,
  website_linked_at,
  last_verification_check,
  created_at
) on public.company_verifications to anon, authenticated;

-- Auto-create verification row for every company
create or replace function public.ensure_company_verification_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.company_verifications (company_id)
  values (new.id)
  on conflict (company_id) do nothing;
  return new;
end;
$$;

drop trigger if exists companies_ensure_verification on public.companies;
create trigger companies_ensure_verification
  after insert on public.companies
  for each row
  execute function public.ensure_company_verification_row();

-- Backfill
insert into public.company_verifications (company_id)
select id from public.companies
on conflict do nothing;

-- Block client writes to companies.verified
create or replace function public.protect_companies_verified_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Allow when session is elevated (service role / table owner via SECURITY DEFINER callers
  -- that set request.jwt.claim.role or when auth.uid() is null under service_role).
  if current_setting('request.jwt.claim.role', true) = 'service_role'
     or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  -- Flag set by our security definer RPCs for intentional sync
  if current_setting('linken.allow_verified_write', true) = 'on' then
    return new;
  end if;

  if new.verified is distinct from old.verified then
    raise exception 'companies.verified is system-managed via domain verification';
  end if;

  return new;
end;
$$;

drop trigger if exists companies_protect_verified on public.companies;
create trigger companies_protect_verified
  before update on public.companies
  for each row
  execute function public.protect_companies_verified_columns();

-- Owner-only token read
create or replace function public.get_verify_token(p_company_id uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_token uuid;
begin
  if auth.uid() is null or not public.is_company_owner(p_company_id) then
    raise exception 'Not allowed';
  end if;

  select verify_token into v_token
  from public.company_verifications
  where company_id = p_company_id;

  if v_token is null then
    insert into public.company_verifications (company_id)
    values (p_company_id)
    on conflict (company_id) do nothing;

    select verify_token into v_token
    from public.company_verifications
    where company_id = p_company_id;
  end if;

  return v_token;
end;
$$;

revoke all on function public.get_verify_token(uuid) from public;
grant execute on function public.get_verify_token(uuid) to authenticated;

-- Rate limit helper (returns false if over limit)
create or replace function public.record_verification_attempt(p_company_id uuid)
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

  insert into public.company_verifications (company_id)
  values (p_company_id)
  on conflict (company_id) do nothing;

  select check_window_start, check_count
  into v_start, v_count
  from public.company_verifications
  where company_id = p_company_id
  for update;

  if v_start is null or v_start < now() - interval '1 hour' then
    update public.company_verifications
    set check_window_start = now(),
        check_count = 1,
        last_verification_check = now()
    where company_id = p_company_id;
    return true;
  end if;

  if v_count >= 5 then
    update public.company_verifications
    set last_verification_check = now()
    where company_id = p_company_id;
    return false;
  end if;

  update public.company_verifications
  set check_count = check_count + 1,
      last_verification_check = now()
  where company_id = p_company_id;

  return true;
end;
$$;

revoke all on function public.record_verification_attempt(uuid) from public;
grant execute on function public.record_verification_attempt(uuid) to authenticated;

-- Mark domain verified (service_role only — called from server with admin client)
create or replace function public.set_domain_verified(
  p_company_id uuid,
  p_method text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_method not in ('email_domain', 'dns_txt', 'meta_tag') then
    raise exception 'Invalid verification method';
  end if;

  insert into public.company_verifications (company_id)
  values (p_company_id)
  on conflict (company_id) do nothing;

  update public.company_verifications
  set verification_method = p_method,
      verified_at = coalesce(verified_at, now()),
      last_verification_check = now()
  where company_id = p_company_id;

  perform set_config('linken.allow_verified_write', 'on', true);
  update public.companies
  set verified = true
  where id = p_company_id;
end;
$$;

revoke all on function public.set_domain_verified(uuid, text) from public;
grant execute on function public.set_domain_verified(uuid, text) to service_role;

create or replace function public.set_domain_unverified(p_company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.company_verifications
  set verification_method = null,
      verified_at = null,
      last_verification_check = now()
  where company_id = p_company_id;

  perform set_config('linken.allow_verified_write', 'on', true);
  update public.companies
  set verified = false
  where id = p_company_id;
end;
$$;

revoke all on function public.set_domain_unverified(uuid) from public;
grant execute on function public.set_domain_unverified(uuid) to service_role;

create or replace function public.set_website_linked(
  p_company_id uuid,
  p_linked boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.company_verifications (company_id)
  values (p_company_id)
  on conflict (company_id) do nothing;

  update public.company_verifications
  set website_linked = p_linked,
      website_linked_at = case when p_linked then coalesce(website_linked_at, now()) else null end,
      last_verification_check = now()
  where company_id = p_company_id;
end;
$$;

revoke all on function public.set_website_linked(uuid, boolean) from public;
grant execute on function public.set_website_linked(uuid, boolean) to service_role;
