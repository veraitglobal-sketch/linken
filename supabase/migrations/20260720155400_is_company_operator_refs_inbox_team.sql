-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260720155400
-- name: is_company_operator_refs_inbox_team
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

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
