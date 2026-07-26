-- Multi-company ownership: one account may own multiple claimed companies.
-- Partner drafts stay claimable; transfer no longer blocked by existing ownership.

alter table public.companies
  drop constraint if exists companies_owner_unique;

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
