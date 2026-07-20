-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260720155359
-- name: is_company_operator_case_studies
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

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
