-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260719234635
-- name: project_requests_credits_fns_a
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

create or replace function public.create_project_request(
  p_requester_name text,
  p_requester_email text,
  p_requester_company text default '',
  p_category text default '',
  p_city text default '',
  p_country text default '',
  p_title text default '',
  p_description text default '',
  p_budget_hint text default '',
  p_timeline text default ''
)
returns table (
  request_id uuid,
  manage_token uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := trim(p_requester_name);
  v_email text := lower(trim(p_requester_email));
  v_company text := coalesce(trim(p_requester_company), '');
  v_category text := trim(p_category);
  v_city text := trim(p_city);
  v_country text := coalesce(trim(p_country), '');
  v_title text := trim(p_title);
  v_description text := trim(p_description);
  v_budget text := coalesce(trim(p_budget_hint), '');
  v_timeline text := coalesce(trim(p_timeline), '');
  v_id uuid;
  v_token uuid;
  v_recent int;
begin
  if v_name = '' then
    raise exception 'Name is required';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Valid email is required';
  end if;
  if v_category = '' then
    raise exception 'Category is required';
  end if;
  if v_city = '' then
    raise exception 'City is required';
  end if;
  if char_length(v_title) < 5 then
    raise exception 'Title must be at least 5 characters';
  end if;
  if char_length(v_description) < 20 then
    raise exception 'Description must be at least 20 characters';
  end if;

  select count(*)::int into v_recent
  from public.project_requests r
  where lower(r.requester_email) = v_email
    and r.created_at > now() - interval '24 hours';

  if v_recent >= 3 then
    raise exception 'Too many requests. Try again tomorrow.';
  end if;

  insert into public.project_requests (
    requester_name, requester_email, requester_company,
    category, city, country, title, description, budget_hint, timeline
  )
  values (
    v_name, v_email, v_company, v_category, v_city, v_country,
    v_title, v_description, v_budget, v_timeline
  )
  returning id, manage_token into v_id, v_token;

  return query select v_id as request_id, v_token as manage_token;
end;
$$;

revoke all on function public.create_project_request(
  text, text, text, text, text, text, text, text, text, text
) from public;
grant execute on function public.create_project_request(
  text, text, text, text, text, text, text, text, text, text
) to anon, authenticated;

create or replace function public.list_open_requests(
  p_category text,
  p_city text
)
returns table (
  id uuid, category text, city text, country text, title text,
  description text, budget_hint text, timeline text, created_at timestamptz,
  responses_count int, max_responses int
)
language sql stable security definer set search_path = public
as $$
  select r.id, r.category, r.city, r.country, r.title, r.description,
    r.budget_hint, r.timeline, r.created_at,
    (select count(*)::int from public.request_responses rr
      where rr.request_id = r.id and rr.status <> 'refunded') as responses_count,
    r.max_responses
  from public.project_requests r
  where r.status = 'open' and r.expires_at > now()
    and lower(r.category) = lower(trim(p_category))
    and lower(r.city) = lower(trim(p_city))
  order by r.created_at desc;
$$;

revoke all on function public.list_open_requests(text, text) from public;
grant execute on function public.list_open_requests(text, text) to authenticated;
