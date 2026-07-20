-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260719234647
-- name: project_requests_credits_fns_c
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

create or replace function public.respond_to_request(
  p_request_id uuid,
  p_message text
)
returns table (
  response_id uuid,
  requester_name text,
  requester_email text,
  credit_balance int
)
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_company public.companies%rowtype;
  v_request public.project_requests%rowtype;
  v_message text := trim(p_message);
  v_count int;
  v_balance int;
  v_response_id uuid;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  if char_length(v_message) < 20 then
    raise exception 'Message must be at least 20 characters';
  end if;

  select c.* into v_company from public.companies c
  where c.owner_id = v_uid and c.claimed is true
  order by c.created_at asc limit 1;

  if v_company.id is null then raise exception 'Company not found'; end if;
  if v_company.verified is not true then
    raise exception 'Verify your domain to respond';
  end if;

  select r.* into v_request from public.project_requests r
  where r.id = p_request_id for update;

  if v_request.id is null then raise exception 'Request not found'; end if;
  if v_request.status <> 'open' or v_request.expires_at <= now() then
    raise exception 'Request is closed';
  end if;

  select count(*)::int into v_count from public.request_responses rr
  where rr.request_id = v_request.id and rr.status <> 'refunded';

  if v_count >= v_request.max_responses then
    raise exception 'Request full';
  end if;

  if exists (
    select 1 from public.request_responses rr
    where rr.request_id = v_request.id and rr.company_id = v_company.id
  ) then
    raise exception 'You already responded to this request';
  end if;

  insert into public.company_credits (company_id, balance, updated_at)
  values (v_company.id, 0, now())
  on conflict (company_id) do nothing;

  select cc.balance into v_balance from public.company_credits cc
  where cc.company_id = v_company.id for update;

  if v_balance is null or v_balance < 1 then
    raise exception 'Insufficient credits';
  end if;

  update public.company_credits
  set balance = balance - 1, updated_at = now()
  where company_id = v_company.id
  returning balance into v_balance;

  insert into public.request_responses (
    request_id, company_id, message, status, credit_spent
  ) values (
    v_request.id, v_company.id, v_message, 'sent', true
  ) returning id into v_response_id;

  insert into public.credit_ledger (company_id, delta, reason, reference_id)
  values (v_company.id, -1, 'response', v_response_id);

  return query select
    v_response_id as response_id,
    v_request.requester_name,
    v_request.requester_email,
    v_balance as credit_balance;
end;
$$;

revoke all on function public.respond_to_request(uuid, text) from public;
grant execute on function public.respond_to_request(uuid, text) to authenticated;

create or replace function public.get_response_contact(p_response_id uuid)
returns table (
  requester_name text, requester_email text, requester_company text
)
language plpgsql stable security definer set search_path = public
as $$
declare v_company_id uuid;
begin
  select rr.company_id into v_company_id from public.request_responses rr
  where rr.id = p_response_id and rr.credit_spent is true and rr.status <> 'refunded';
  if v_company_id is null then raise exception 'Response not found'; end if;
  if not public.is_company_owner(v_company_id) then raise exception 'Not allowed'; end if;
  return query
  select r.requester_name, r.requester_email, r.requester_company
  from public.request_responses rr
  join public.project_requests r on r.id = rr.request_id
  where rr.id = p_response_id;
end;
$$;

revoke all on function public.get_response_contact(uuid) from public;
grant execute on function public.get_response_contact(uuid) to authenticated;
