-- Staff may clear company ownership when deleting an Auth login.

create or replace function public.admin_clear_company_owner(p_company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('linken.allow_identity_write', 'on', true);
  update public.companies
  set
    owner_id = null,
    claimed = false,
    staff_hidden_at = coalesce(staff_hidden_at, timezone('utc', now()))
  where id = p_company_id;
end;
$$;

revoke all on function public.admin_clear_company_owner(uuid) from public;
grant execute on function public.admin_clear_company_owner(uuid) to service_role;

comment on function public.admin_clear_company_owner(uuid) is
  'Service-role only. Hides the company and clears owner_id/claimed for account deletion.';
