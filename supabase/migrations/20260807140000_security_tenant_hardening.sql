-- Security hardening: pending data RLS, claim/transfer email bind, preview privacy.

-- 1) Public may only read confirmed service references.
drop policy if exists "service_references_public_read" on public.service_references;

create policy "service_references_public_read_confirmed"
on public.service_references for select
using (
  status = 'confirmed'
  or public.is_company_owner(provider_company_id)
  or (
    client_company_id is not null
    and public.is_company_owner(client_company_id)
  )
);

-- 2) Case study partners: public confirmed only; owners/operators see pending.
drop policy if exists "case_study_partners_public_read" on public.case_study_partners;

create policy "case_study_partners_public_read_confirmed"
on public.case_study_partners for select
using (
  confirmed = true
  or exists (
    select 1 from public.case_studies cs
    where cs.id = case_study_id
      and (
        public.is_company_owner(cs.company_id)
        or public.is_company_operator(cs.company_id)
      )
  )
  or (
    partner_company_id is not null
    and public.is_company_owner(partner_company_id)
  )
);

-- 3) Claim requires session email = invite_email when set.
create or replace function public.claim_company(p_token uuid)
returns public.companies
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  session_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  row public.companies;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into row
  from public.companies c
  where c.claim_token = p_token
    and c.claimed = false
  for update;

  if row.id is null then
    raise exception 'Invalid or already claimed';
  end if;

  if row.invite_email is not null
     and length(trim(row.invite_email)) > 0
     and lower(trim(row.invite_email)) is distinct from session_email then
    raise exception 'Sign in with the invite email to claim this company';
  end if;

  update public.companies c
  set
    owner_id = uid,
    claimed = true,
    claim_token = null,
    updated_at = now()
  where c.id = row.id
  returning * into row;

  return row;
end;
$$;

revoke all on function public.claim_company(uuid) from public;
grant execute on function public.claim_company(uuid) to authenticated;

-- 4) Ownership transfer: accepter email must match invite_email.
create or replace function public.accept_ownership_transfer(p_token uuid)
returns public.companies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transfer public.ownership_transfers;
  v_company public.companies;
  v_old_owner uuid;
  session_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_transfer
  from public.ownership_transfers
  where token = p_token
    and status = 'pending'
  for update;

  if v_transfer.id is null then
    raise exception 'Transfer not found or already resolved';
  end if;

  if lower(trim(v_transfer.invite_email)) is distinct from session_email then
    raise exception 'Sign in with the transfer invite email to accept';
  end if;

  select * into v_company
  from public.companies
  where id = v_transfer.company_id
  for update;

  if v_company.owner_id is distinct from v_transfer.current_owner_id then
    raise exception 'Ownership changed; transfer is no longer valid';
  end if;

  v_old_owner := v_company.owner_id;

  update public.companies
  set owner_id = auth.uid()
  where id = v_company.id
  returning * into v_company;

  insert into public.company_members (company_id, user_id, role)
  values (v_company.id, auth.uid(), 'owner')
  on conflict (company_id, user_id) do update set role = 'owner';

  update public.company_members
  set role = 'member'
  where company_id = v_company.id
    and user_id = v_old_owner;

  insert into public.company_members (company_id, user_id, role)
  values (v_company.id, v_old_owner, 'member')
  on conflict (company_id, user_id) do update set role = 'member';

  update public.ownership_transfers
  set status = 'accepted', resolved_at = now()
  where id = v_transfer.id;

  update public.ownership_transfers
  set status = 'cancelled', resolved_at = now()
  where company_id = v_company.id
    and status = 'pending'
    and id <> v_transfer.id;

  return v_company;
end;
$$;

revoke all on function public.accept_ownership_transfer(uuid) from public;
grant execute on function public.accept_ownership_transfer(uuid) to authenticated;

-- 5) Preview: never return invite_email after the request is resolved.
create or replace function public.get_service_reference_preview(p_token uuid)
returns table (
  id uuid,
  status text,
  service text,
  started_year text,
  ongoing boolean,
  ended_year text,
  client_name text,
  invite_email text,
  provider_id uuid,
  provider_name text,
  provider_slug text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.status,
    r.service,
    r.started_year,
    r.ongoing,
    r.ended_year,
    r.client_name,
    case when r.status = 'pending' then r.invite_email else null end,
    p.id,
    p.name,
    p.slug
  from public.service_references r
  join public.companies p on p.id = r.provider_company_id
  where r.confirm_token = p_token
  limit 1;
$$;
