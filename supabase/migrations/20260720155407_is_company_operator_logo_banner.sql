-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260720155407
-- name: is_company_operator_logo_banner
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

create or replace function public.record_logo_refresh_attempt(p_company_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz;
  v_count int;
begin
  if auth.uid() is null or not public.is_company_operator(p_company_id) then
    raise exception 'Not allowed';
  end if;

  select logo_refresh_window_start, logo_refresh_count
  into v_start, v_count
  from public.companies
  where id = p_company_id
  for update;

  if not found then
    raise exception 'Company not found';
  end if;

  if v_start is null or v_start < date_trunc('day', now()) then
    update public.companies
    set logo_refresh_window_start = now(),
        logo_refresh_count = 1
    where id = p_company_id;
    return true;
  end if;

  if v_count >= 3 then
    return false;
  end if;

  update public.companies
  set logo_refresh_count = v_count + 1
  where id = p_company_id;

  return true;
end;
$$;

drop policy if exists "team_invitations_admin_select" on public.team_invitations;
create policy "team_invitations_admin_select"
on public.team_invitations for select
to authenticated
using (
  public.is_company_member(company_id, 'admin')
  or public.is_company_operator(company_id)
);

drop policy if exists "team_invitations_admin_cancel" on public.team_invitations;
create policy "team_invitations_admin_cancel"
on public.team_invitations for update
to authenticated
using (
  (public.is_company_member(company_id, 'admin') or public.is_company_operator(company_id))
  and status = 'pending'
)
with check (
  (public.is_company_member(company_id, 'admin') or public.is_company_operator(company_id))
  and status = 'cancelled'
);

create or replace function public.get_operator_branch_banner(p_company_id uuid)
returns table (
  creator_name text,
  has_invite_email boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(nullif(trim(creator.name), ''), 'The parent company')::text,
    (c.invite_email is not null and length(trim(c.invite_email)) > 0)
  from public.companies c
  left join public.companies creator on creator.id = c.created_by_company_id
  where c.id = p_company_id
    and c.claimed = false
    and public.is_company_operator(p_company_id);
$$;

revoke all on function public.get_operator_branch_banner(uuid) from public;
grant execute on function public.get_operator_branch_banner(uuid) to authenticated;

create or replace function public.operator_resend_claim_invite(p_company_id uuid)
returns table (invite_email text, claim_token uuid, company_name text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_company_operator(p_company_id) then
    raise exception 'Not allowed';
  end if;

  return query
  select
    c.invite_email,
    c.claim_token,
    c.name
  from public.companies c
  where c.id = p_company_id
    and c.claimed = false
    and c.invite_email is not null
    and c.claim_token is not null;
end;
$$;

revoke all on function public.operator_resend_claim_invite(uuid) from public;
grant execute on function public.operator_resend_claim_invite(uuid) to authenticated;
