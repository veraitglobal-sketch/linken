-- Part A: operational control over own unclaimed branches (until claimed).

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

-- Operators must not escalate identity / claim fields on unclaimed rows.
-- Allows claim_company + ownership transfer accept paths.
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

  -- claim_company: unclaimed → claimed by the claiming user
  if old.claimed = false
     and new.claimed = true
     and new.owner_id = auth.uid()
     and old.claim_token is not null
     and new.claim_token is null
  then
    return new;
  end if;

  -- accept_ownership_transfer: pending transfer to auth.uid()
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

-- Companies UPDATE: operators (incl. unclaimed branch managers).
drop policy if exists "companies_owner_update" on public.companies;
create policy "companies_operator_update"
on public.companies for update
to authenticated
using (public.is_company_operator(id))
with check (public.is_company_operator(id));

-- Create unclaimed ghosts: admin of creator firm.
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

-- Case studies CRUD (not partner/client confirm).
drop policy if exists "case_studies_owner_insert" on public.case_studies;
drop policy if exists "case_studies_owner_update" on public.case_studies;
drop policy if exists "case_studies_owner_delete" on public.case_studies;

create policy "case_studies_operator_insert"
on public.case_studies for insert
to authenticated
with check (public.is_company_operator(company_id));

create policy "case_studies_operator_update"
on public.case_studies for update
to authenticated
using (public.is_company_operator(company_id))
with check (public.is_company_operator(company_id));

create policy "case_studies_operator_delete"
on public.case_studies for delete
to authenticated
using (public.is_company_operator(company_id));

-- Case study partners (owner-side CRUD — not partner_confirm).
drop policy if exists "case_study_partners_owner_insert" on public.case_study_partners;
drop policy if exists "case_study_partners_owner_update_unconfirmed" on public.case_study_partners;
drop policy if exists "case_study_partners_owner_delete" on public.case_study_partners;

create policy "case_study_partners_operator_insert"
on public.case_study_partners for insert
to authenticated
with check (
  confirmed = false
  and confirmed_at is null
  and exists (
    select 1 from public.case_studies cs
    where cs.id = case_study_id
      and public.is_company_operator(cs.company_id)
  )
);

create policy "case_study_partners_operator_update_unconfirmed"
on public.case_study_partners for update
to authenticated
using (
  confirmed = false
  and exists (
    select 1 from public.case_studies cs
    where cs.id = case_study_id
      and public.is_company_operator(cs.company_id)
  )
)
with check (
  confirmed = false
  and confirmed_at is null
  and exists (
    select 1 from public.case_studies cs
    where cs.id = case_study_id
      and public.is_company_operator(cs.company_id)
  )
);

create policy "case_study_partners_operator_delete"
on public.case_study_partners for delete
to authenticated
using (
  exists (
    select 1 from public.case_studies cs
    where cs.id = case_study_id
      and public.is_company_operator(cs.company_id)
  )
);

-- Client confirmation requests (create/cancel — not respond_*).
drop policy if exists "client_confirm_owner_insert"
  on public.case_study_client_confirmation_requests;
drop policy if exists "client_confirm_requester_delete_pending"
  on public.case_study_client_confirmation_requests;

create policy "client_confirm_operator_insert"
on public.case_study_client_confirmation_requests for insert
to authenticated
with check (
  public.is_company_operator(requested_by_company_id)
  and exists (
    select 1 from public.case_studies cs
    where cs.id = case_study_id
      and cs.company_id = requested_by_company_id
      and public.is_company_operator(cs.company_id)
  )
);

create policy "client_confirm_operator_delete_pending"
on public.case_study_client_confirmation_requests for delete
to authenticated
using (
  status = 'pending'
  and public.is_company_operator(requested_by_company_id)
);

-- Also allow operators to see their pending requests (select was owner-gated).
drop policy if exists "client_confirm_public_read_confirmed"
  on public.case_study_client_confirmation_requests;
create policy "client_confirm_public_read_confirmed"
on public.case_study_client_confirmation_requests for select
using (
  status = 'confirmed'
  or public.is_company_operator(requested_by_company_id)
  or (
    confirmed_by_company_id is not null
    and public.is_company_owner(confirmed_by_company_id)
  )
);

-- Service references (provider CRUD — not confirm_*).
drop policy if exists "service_references_provider_insert" on public.service_references;
drop policy if exists "service_references_provider_delete" on public.service_references;
drop policy if exists "service_references_provider_update_pending" on public.service_references;

create policy "service_references_operator_insert"
on public.service_references for insert
to authenticated
with check (public.is_company_operator(provider_company_id));

create policy "service_references_operator_delete"
on public.service_references for delete
to authenticated
using (public.is_company_operator(provider_company_id));

create policy "service_references_operator_update_pending"
on public.service_references for update
to authenticated
using (
  status = 'pending'
  and public.is_company_operator(provider_company_id)
)
with check (
  status = 'pending'
  and public.is_company_operator(provider_company_id)
);

-- Inquiries (inbox ops).
drop policy if exists "inquiries_owner_select" on public.inquiries;
drop policy if exists "inquiries_owner_update" on public.inquiries;
drop policy if exists "inquiries_owner_delete" on public.inquiries;

create policy "inquiries_operator_select"
on public.inquiries for select
to authenticated
using (public.is_company_operator(company_id));

create policy "inquiries_operator_update"
on public.inquiries for update
to authenticated
using (public.is_company_operator(company_id))
with check (public.is_company_operator(company_id));

create policy "inquiries_operator_delete"
on public.inquiries for delete
to authenticated
using (public.is_company_operator(company_id));

-- Team member delete by operator.
drop policy if exists "company_members_delete" on public.company_members;
create policy "company_members_delete"
on public.company_members for delete
to authenticated
using (
  role <> 'owner'
  and (
    user_id = auth.uid()
    or public.is_company_operator(company_id)
  )
);

-- Logo refresh rate limit → operator.
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

-- Team invitations: operator OR admin member.
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

-- Banner meta for operators (no invite_email leak via REST).
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

-- Operator-initiated claim invite resend payload.
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
