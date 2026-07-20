-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260720155435
-- name: member_section_permissions_2
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

-- has_section_access: owner/admin always; member if section listed.
create or replace function public.has_section_access(
  p_company_id uuid,
  p_section text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when not public.is_valid_workspace_section(p_section) then false
      when public.is_company_member(p_company_id, 'admin') then true
      when public.is_company_operator(p_company_id) then true
      else exists (
        select 1
        from public.company_members m
        where m.company_id = p_company_id
          and m.user_id = auth.uid()
          and m.role = 'member'
          and lower(trim(p_section)) = any (m.permissions)
      )
    end;
$$;

revoke all on function public.has_section_access(uuid, text) from public;
grant execute on function public.has_section_access(uuid, text) to authenticated;

-- Admin/operator may update member permissions (not role/owner rows via this grant).
drop policy if exists "company_members_admin_update_permissions" on public.company_members;
create policy "company_members_admin_update_permissions"
on public.company_members for update
to authenticated
using (
  role = 'member'
  and (
    public.is_company_member(company_id, 'admin')
    or public.is_company_operator(company_id)
  )
)
with check (
  role = 'member'
  and (
    public.is_company_member(company_id, 'admin')
    or public.is_company_operator(company_id)
  )
);

grant update (permissions) on public.company_members to authenticated;

-- Members must not self-escalate section permissions.
create or replace function public.company_members_protect_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.permissions is distinct from new.permissions then
    if not (
      public.is_company_member(old.company_id, 'admin')
      or public.is_company_operator(old.company_id)
    ) then
      raise exception 'Only owner or admin can change section permissions.';
    end if;
    if new.role <> 'member' then
      new.permissions := '{}';
    else
      new.permissions := public.normalize_section_permissions(new.permissions);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists company_members_protect_permissions on public.company_members;
create trigger company_members_protect_permissions
  before update on public.company_members
  for each row
  execute function public.company_members_protect_permissions();
