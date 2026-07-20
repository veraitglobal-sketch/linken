-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260719234644
-- name: project_requests_credits_fns_b
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

create or replace function public.get_request_by_manage_token(p_token uuid)
returns table (
  id uuid, requester_name text, requester_email text, requester_company text,
  category text, city text, country text, title text, description text,
  budget_hint text, timeline text, status text, max_responses int,
  created_at timestamptz, expires_at timestamptz, responses_count int
)
language sql stable security definer set search_path = public
as $$
  select r.id, r.requester_name, r.requester_email, r.requester_company,
    r.category, r.city, r.country, r.title, r.description,
    r.budget_hint, r.timeline, r.status, r.max_responses,
    r.created_at, r.expires_at,
    (select count(*)::int from public.request_responses rr
      where rr.request_id = r.id and rr.status <> 'refunded') as responses_count
  from public.project_requests r
  where r.manage_token = p_token;
$$;

revoke all on function public.get_request_by_manage_token(uuid) from public;
grant execute on function public.get_request_by_manage_token(uuid) to anon, authenticated;

create or replace function public.list_responses_for_manage_token(p_token uuid)
returns table (
  response_id uuid, company_id uuid, company_name text, company_slug text,
  company_verified boolean, message text, status text, created_at timestamptz
)
language sql stable security definer set search_path = public
as $$
  select rr.id, c.id, c.name, c.slug, coalesce(c.verified, false),
    rr.message, rr.status, rr.created_at
  from public.project_requests r
  join public.request_responses rr on rr.request_id = r.id
  join public.companies c on c.id = rr.company_id
  where r.manage_token = p_token and rr.status <> 'refunded'
  order by rr.created_at asc;
$$;

revoke all on function public.list_responses_for_manage_token(uuid) from public;
grant execute on function public.list_responses_for_manage_token(uuid) to anon, authenticated;

create or replace function public.close_project_request(p_token uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare v_id uuid;
begin
  select r.id into v_id from public.project_requests r
  where r.manage_token = p_token for update;
  if v_id is null then raise exception 'Invalid manage link'; end if;
  update public.project_requests set status = 'closed'
  where id = v_id and status = 'open';
end;
$$;

revoke all on function public.close_project_request(uuid) from public;
grant execute on function public.close_project_request(uuid) to anon, authenticated;

create or replace function public.mark_manage_responses_seen(p_token uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare v_id uuid;
begin
  select r.id into v_id from public.project_requests r where r.manage_token = p_token;
  if v_id is null then return; end if;
  update public.request_responses
  set status = 'seen', seen_at = coalesce(seen_at, now())
  where request_id = v_id and status = 'sent';
end;
$$;

revoke all on function public.mark_manage_responses_seen(uuid) from public;
grant execute on function public.mark_manage_responses_seen(uuid) to anon, authenticated;
