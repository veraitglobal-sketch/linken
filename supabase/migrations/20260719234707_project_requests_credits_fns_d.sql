-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260719234707
-- name: project_requests_credits_fns_d
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

create or replace function public.list_my_request_responses()
returns table (
  response_id uuid, request_id uuid, title text, category text, city text,
  message text, status text, created_at timestamptz,
  requester_name text, requester_email text, requester_company text
)
language plpgsql stable security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_company_id uuid;
begin
  if v_uid is null then return; end if;
  select c.id into v_company_id from public.companies c
  where c.owner_id = v_uid and c.claimed is true
  order by c.created_at asc limit 1;
  if v_company_id is null then return; end if;
  return query
  select rr.id, r.id, r.title, r.category, r.city, rr.message, rr.status,
    rr.created_at, r.requester_name, r.requester_email, r.requester_company
  from public.request_responses rr
  join public.project_requests r on r.id = rr.request_id
  where rr.company_id = v_company_id
    and rr.credit_spent is true and rr.status <> 'refunded'
  order by rr.created_at desc;
end;
$$;

revoke all on function public.list_my_request_responses() from public;
grant execute on function public.list_my_request_responses() to authenticated;

create or replace function public.refund_response(p_response_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_rr public.request_responses%rowtype;
  v_balance int;
begin
  -- TODO: cron — refund unseen responses after 7 days (status still 'sent').
  select rr.* into v_rr from public.request_responses rr
  where rr.id = p_response_id for update;
  if v_rr.id is null then raise exception 'Response not found'; end if;
  if v_rr.status = 'refunded' or v_rr.credit_spent is not true then
    raise exception 'Response is not refundable';
  end if;
  if v_rr.status <> 'sent' then
    raise exception 'Only unopened responses can be refunded';
  end if;
  update public.request_responses set status = 'refunded' where id = v_rr.id;
  insert into public.company_credits (company_id, balance, updated_at)
  values (v_rr.company_id, 0, now()) on conflict (company_id) do nothing;
  select cc.balance into v_balance from public.company_credits cc
  where cc.company_id = v_rr.company_id for update;
  update public.company_credits
  set balance = balance + 1, updated_at = now()
  where company_id = v_rr.company_id;
  insert into public.credit_ledger (company_id, delta, reason, reference_id)
  values (v_rr.company_id, 1, 'refund', v_rr.id);
end;
$$;

revoke all on function public.refund_response(uuid) from public;
revoke all on function public.refund_response(uuid) from anon, authenticated;
grant execute on function public.refund_response(uuid) to service_role;

create or replace function public.admin_grant_credits(
  p_company_id uuid, p_amount int, p_reason text default 'admin'
)
returns int language plpgsql security definer set search_path = public
as $$
declare
  v_balance int;
  v_reason text := coalesce(nullif(trim(p_reason), ''), 'admin');
begin
  if p_company_id is null then raise exception 'company_id is required'; end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;
  if v_reason not in ('monthly_grant', 'purchase', 'admin') then
    raise exception 'Invalid grant reason';
  end if;
  if not exists (select 1 from public.companies c where c.id = p_company_id) then
    raise exception 'Company not found';
  end if;
  insert into public.company_credits (company_id, balance, updated_at)
  values (p_company_id, 0, now()) on conflict (company_id) do nothing;
  select cc.balance into v_balance from public.company_credits cc
  where cc.company_id = p_company_id for update;
  update public.company_credits
  set balance = balance + p_amount, updated_at = now()
  where company_id = p_company_id returning balance into v_balance;
  insert into public.credit_ledger (company_id, delta, reason, reference_id)
  values (p_company_id, p_amount, v_reason, null);
  return v_balance;
end;
$$;

revoke all on function public.admin_grant_credits(uuid, int, text) from public;
revoke all on function public.admin_grant_credits(uuid, int, text) from anon, authenticated;
grant execute on function public.admin_grant_credits(uuid, int, text) to service_role;
