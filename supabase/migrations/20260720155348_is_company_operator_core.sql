-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260720155348
-- name: is_company_operator_core
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
  'True owner, or admin/owner of the creator firm for an unclaimed branch.';

revoke all on function public.is_company_operator(uuid) from public;
grant execute on function public.is_company_operator(uuid) to authenticated;

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
    or old.plan is distinct from new.plan
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

drop trigger if exists companies_protect_identity_fields on public.companies;
create trigger companies_protect_identity_fields
  before update on public.companies
  for each row
  execute function public.companies_protect_identity_fields();

drop policy if exists "companies_owner_update" on public.companies;
create policy "companies_operator_update"
on public.companies for update
to authenticated
using (public.is_company_operator(id))
with check (public.is_company_operator(id));

drop policy if exists "companies_owner_insert_unclaimed" on public.companies;
create policy "companies_operator_insert_unclaimed"
on public.companies for insert
to authenticated
with check (
  claimed = false
  and owner_id is null
  and claim_token is not null
  and created_by_company_id is not null
  and public.is_company_member(created_by_company_id, 'admin')
);
