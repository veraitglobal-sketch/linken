-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260720160509
-- name: protect_plan_column
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

create or replace function public.is_company_operator(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_company_owner(p_company_id)
    or public.is_company_member(p_company_id, 'admin')
    or exists (
      select 1
      from public.companies c
      where c.id = p_company_id
        and c.claimed = false
        and c.created_by_company_id is not null
        and public.is_company_member(c.created_by_company_id, 'admin')
    );
$$;

comment on function public.is_company_operator(uuid) is
  'Owner, same-company admin, or admin of the creator firm for an unclaimed branch.';

create or replace function public.companies_protect_identity_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP <> 'UPDATE' then
    return new;
  end if;

  if not (
    old.claimed is distinct from new.claimed
    or old.owner_id is distinct from new.owner_id
    or old.claim_token is distinct from new.claim_token
    or old.slug is distinct from new.slug
    or old.created_by_company_id is distinct from new.created_by_company_id
  ) then
    return new;
  end if;

  if current_setting('linken.allow_identity_write', true) = 'on' then
    return new;
  end if;

  if public.is_company_owner(old.id) then
    return new;
  end if;

  if old.claimed = false
     and new.claimed = true
     and new.owner_id = auth.uid()
     and old.claim_token is not null
     and new.claim_token is null
  then
    return new;
  end if;

  if old.claimed = true
     and new.owner_id = auth.uid()
     and old.owner_id is distinct from new.owner_id
     and exists (
       select 1
       from public.ownership_transfers t
       where t.company_id = old.id
         and t.status = 'pending'
         and t.current_owner_id = old.owner_id
     )
  then
    return new;
  end if;

  raise exception 'Identity fields can only be changed by the company owner.';
end;
$$;

create or replace function public.protect_companies_plan_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'service_role'
     or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if current_setting('linken.allow_identity_write', true) = 'on' then
    return new;
  end if;

  if new.plan is distinct from old.plan then
    raise exception 'companies.plan is system-managed and cannot be changed by clients.';
  end if;

  return new;
end;
$$;

drop trigger if exists companies_protect_plan on public.companies;
create trigger companies_protect_plan
  before update on public.companies
  for each row
  execute function public.protect_companies_plan_column();
