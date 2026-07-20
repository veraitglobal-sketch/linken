-- Linken Radar: marketplace add-on flag (NOT a public badge).
-- Chosen over plan='radar' so Radar can stack with free/pro/founding.
-- Brand rule: never expose on public profile or buyer-facing surfaces.

alter table public.companies
  add column if not exists radar boolean not null default false;

-- Harden column grants: a table-level SELECT would leak claim_token,
-- invite_email, and radar. Re-assert the public allowlist, then grant
-- radar to authenticated only (dashboard session — never anon / public profile).
revoke select on public.companies from anon, authenticated;

grant select (
  id, owner_id, name, slug, tagline, description, category, city, country,
  website, logo_url, services, verified, created_at, updated_at,
  claimed, created_by_company_id, accepting_clients, plan,
  logo_source, linkedin_url, facebook_url,
  allow_logo_in_partner_widgets, widget_settings
) on public.companies to anon, authenticated;

grant select (radar) on public.companies to authenticated;

-- Only Radar firms may spend credits on marketplace responses.
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
language plpgsql
security definer
set search_path = public
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
  if v_uid is null then
    raise exception 'Sign in required';
  end if;

  if char_length(v_message) < 20 then
    raise exception 'Message must be at least 20 characters';
  end if;

  select c.* into v_company
  from public.companies c
  where c.owner_id = v_uid
    and c.claimed is true
  order by c.created_at asc
  limit 1;

  if v_company.id is null then
    raise exception 'Company not found';
  end if;

  if v_company.radar is not true then
    raise exception 'Radar — coming soon';
  end if;

  if v_company.verified is not true then
    raise exception 'Verify your domain to respond';
  end if;

  select r.* into v_request
  from public.project_requests r
  where r.id = p_request_id
  for update;

  if v_request.id is null then
    raise exception 'Request not found';
  end if;

  if v_request.status <> 'open' or v_request.expires_at <= now() then
    raise exception 'Request is closed';
  end if;

  select count(*)::int into v_count
  from public.request_responses rr
  where rr.request_id = v_request.id
    and rr.status <> 'refunded';

  if v_count >= v_request.max_responses then
    raise exception 'Request full';
  end if;

  if exists (
    select 1
    from public.request_responses rr
    where rr.request_id = v_request.id
      and rr.company_id = v_company.id
  ) then
    raise exception 'You already responded to this request';
  end if;

  insert into public.company_credits (company_id, balance, updated_at)
  values (v_company.id, 0, now())
  on conflict (company_id) do nothing;

  select cc.balance into v_balance
  from public.company_credits cc
  where cc.company_id = v_company.id
  for update;

  if v_balance is null or v_balance < 1 then
    raise exception 'Insufficient credits';
  end if;

  update public.company_credits
  set balance = balance - 1,
      updated_at = now()
  where company_id = v_company.id
  returning balance into v_balance;

  insert into public.request_responses (
    request_id,
    company_id,
    message,
    status,
    credit_spent
  )
  values (
    v_request.id,
    v_company.id,
    v_message,
    'sent',
    true
  )
  returning id into v_response_id;

  insert into public.credit_ledger (
    company_id,
    delta,
    reason,
    reference_id
  )
  values (
    v_company.id,
    -1,
    'response',
    v_response_id
  );

  return query
  select
    v_response_id as response_id,
    v_request.requester_name,
    v_request.requester_email,
    v_balance as credit_balance;
end;
$$;

revoke all on function public.respond_to_request(uuid, text) from public, anon;
grant execute on function public.respond_to_request(uuid, text) to authenticated;

-- Digest emails only for Radar firms (radarInstantAlerts).
create or replace function public.prepare_request_notifications(p_request_id uuid)
returns table (
  company_id uuid,
  notify_email text,
  company_name text,
  request_titles text[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.project_requests%rowtype;
  v_company record;
  v_titles text[];
  v_email text;
begin
  select r.* into v_req
  from public.project_requests r
  where r.id = p_request_id;

  if v_req.id is null then
    return;
  end if;

  insert into public.request_digest_queue (company_id, request_id)
  select c.id, v_req.id
  from public.companies c
  where c.claimed is true
    and c.verified is true
    and c.radar is true
    and lower(c.category) = lower(v_req.category)
    and lower(c.city) = lower(v_req.city)
  on conflict do nothing;

  for v_company in
    select distinct q.company_id
    from public.request_digest_queue q
    left join public.request_digest_sent s on s.company_id = q.company_id
    where q.company_id in (
      select c.id
      from public.companies c
      where c.claimed is true
        and c.verified is true
        and c.radar is true
        and lower(c.category) = lower(v_req.category)
        and lower(c.city) = lower(v_req.city)
    )
    and (
      s.last_sent_at is null
      or s.last_sent_at <= now() - interval '24 hours'
    )
  loop
    select coalesce(array_agg(r.title order by r.created_at), array[]::text[])
    into v_titles
    from public.request_digest_queue q
    join public.project_requests r on r.id = q.request_id
    where q.company_id = v_company.company_id
      and r.status = 'open'
      and r.expires_at > now();

    if v_titles is null or cardinality(v_titles) = 0 then
      delete from public.request_digest_queue q
      where q.company_id = v_company.company_id;
      continue;
    end if;

    select coalesce(
      nullif(trim(u.email), ''),
      nullif(trim(c.invite_email), '')
    )
    into v_email
    from public.companies c
    left join auth.users u on u.id = c.owner_id
    where c.id = v_company.company_id;

    if v_email is null or v_email = '' then
      continue;
    end if;

    delete from public.request_digest_queue q
    where q.company_id = v_company.company_id;

    insert into public.request_digest_sent (company_id, last_sent_at)
    values (v_company.company_id, now())
    on conflict (company_id) do update
    set last_sent_at = excluded.last_sent_at;

    company_id := v_company.company_id;
    notify_email := v_email;
    company_name := (
      select c.name from public.companies c where c.id = v_company.company_id
    );
    request_titles := v_titles;
    return next;
  end loop;
end;
$$;

revoke all on function public.prepare_request_notifications(uuid) from public;
revoke all on function public.prepare_request_notifications(uuid) from anon, authenticated;
grant execute on function public.prepare_request_notifications(uuid) to service_role;
