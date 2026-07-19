-- Project Requests: lead marketplace with credits.
-- Sacred rule: profile inquiries stay free forever. Credits apply ONLY to
-- platform-distributed project_requests — never to leads a firm earned itself.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.project_requests (
  id uuid primary key default gen_random_uuid(),
  requester_name text not null,
  requester_email text not null,
  requester_company text not null default '',
  category text not null,
  city text not null,
  country text not null default '',
  title text not null,
  description text not null,
  budget_hint text not null default '',
  timeline text not null default '',
  status text not null default 'open'
    check (status in ('open', 'closed', 'expired')),
  max_responses int not null default 5,
  manage_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create index project_requests_open_match_idx
  on public.project_requests (lower(category), lower(city), status, expires_at)
  where status = 'open';

create table public.request_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.project_requests (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  message text not null,
  status text not null default 'sent'
    check (status in ('sent', 'seen', 'shortlisted', 'declined', 'refunded')),
  credit_spent boolean not null default true,
  created_at timestamptz not null default now(),
  seen_at timestamptz,
  constraint one_response_per_request unique (request_id, company_id)
);

create index request_responses_company_idx
  on public.request_responses (company_id, created_at desc);

create index request_responses_request_idx
  on public.request_responses (request_id, created_at);

create table public.company_credits (
  company_id uuid primary key references public.companies (id) on delete cascade,
  balance int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table public.credit_ledger (
  id bigint generated always as identity primary key,
  company_id uuid not null references public.companies (id) on delete cascade,
  delta int not null,
  reason text not null
    check (reason in ('monthly_grant', 'response', 'refund', 'purchase', 'admin')),
  reference_id uuid,
  created_at timestamptz not null default now()
);

create index credit_ledger_company_idx
  on public.credit_ledger (company_id, created_at desc);

-- Digest: max 1 email/day per firm; queue accumulates matching requests.
create table public.request_digest_queue (
  company_id uuid not null references public.companies (id) on delete cascade,
  request_id uuid not null references public.project_requests (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (company_id, request_id)
);

create table public.request_digest_sent (
  company_id uuid primary key references public.companies (id) on delete cascade,
  last_sent_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS + column grants (money + private contacts)
-- ---------------------------------------------------------------------------

alter table public.project_requests enable row level security;
alter table public.request_responses enable row level security;
alter table public.company_credits enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.request_digest_queue enable row level security;
alter table public.request_digest_sent enable row level security;

-- project_requests: NO direct SELECT for anon/authenticated.
-- Readable only via security definer functions (safe columns / manage token).
revoke all on table public.project_requests from public;
revoke all on table public.project_requests from anon, authenticated;

-- request_responses: owner sees own rows only (no requester contact columns here)
create policy "request_responses_owner_select"
on public.request_responses for select
to authenticated
using (public.is_company_owner(company_id));

revoke all on table public.request_responses from public;
revoke all on table public.request_responses from anon, authenticated;

grant select (
  id, request_id, company_id, message, status, credit_spent, created_at, seen_at
) on table public.request_responses to authenticated;

-- company_credits / credit_ledger: SELECT owner only; NO client writes
create policy "company_credits_owner_select"
on public.company_credits for select
to authenticated
using (public.is_company_owner(company_id));

create policy "credit_ledger_owner_select"
on public.credit_ledger for select
to authenticated
using (public.is_company_owner(company_id));

revoke all on table public.company_credits from public;
revoke all on table public.company_credits from anon, authenticated;
grant select (company_id, balance, updated_at)
  on table public.company_credits to authenticated;

revoke all on table public.credit_ledger from public;
revoke all on table public.credit_ledger from anon, authenticated;
grant select (id, company_id, delta, reason, reference_id, created_at)
  on table public.credit_ledger to authenticated;

-- Digest tables: service_role / definer only
revoke all on table public.request_digest_queue from public;
revoke all on table public.request_digest_queue from anon, authenticated;
revoke all on table public.request_digest_sent from public;
revoke all on table public.request_digest_sent from anon, authenticated;

-- ---------------------------------------------------------------------------
-- create_project_request (anon OK; rate limit 3/day by email)
-- ---------------------------------------------------------------------------

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
    requester_name,
    requester_email,
    requester_company,
    category,
    city,
    country,
    title,
    description,
    budget_hint,
    timeline
  )
  values (
    v_name,
    v_email,
    v_company,
    v_category,
    v_city,
    v_country,
    v_title,
    v_description,
    v_budget,
    v_timeline
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

-- ---------------------------------------------------------------------------
-- list_open_requests — safe columns only (no email, no manage_token)
-- ---------------------------------------------------------------------------

create or replace function public.list_open_requests(
  p_category text,
  p_city text
)
returns table (
  id uuid,
  category text,
  city text,
  country text,
  title text,
  description text,
  budget_hint text,
  timeline text,
  created_at timestamptz,
  responses_count int,
  max_responses int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.category,
    r.city,
    r.country,
    r.title,
    r.description,
    r.budget_hint,
    r.timeline,
    r.created_at,
    (
      select count(*)::int
      from public.request_responses rr
      where rr.request_id = r.id
        and rr.status <> 'refunded'
    ) as responses_count,
    r.max_responses
  from public.project_requests r
  where r.status = 'open'
    and r.expires_at > now()
    and lower(r.category) = lower(trim(p_category))
    and lower(r.city) = lower(trim(p_city))
  order by r.created_at desc;
$$;

revoke all on function public.list_open_requests(text, text) from public, anon;
grant execute on function public.list_open_requests(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Buyer manage-token flow
-- ---------------------------------------------------------------------------

create or replace function public.get_request_by_manage_token(p_token uuid)
returns table (
  id uuid,
  requester_name text,
  requester_email text,
  requester_company text,
  category text,
  city text,
  country text,
  title text,
  description text,
  budget_hint text,
  timeline text,
  status text,
  max_responses int,
  created_at timestamptz,
  expires_at timestamptz,
  responses_count int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.requester_name,
    r.requester_email,
    r.requester_company,
    r.category,
    r.city,
    r.country,
    r.title,
    r.description,
    r.budget_hint,
    r.timeline,
    r.status,
    r.max_responses,
    r.created_at,
    r.expires_at,
    (
      select count(*)::int
      from public.request_responses rr
      where rr.request_id = r.id
        and rr.status <> 'refunded'
    ) as responses_count
  from public.project_requests r
  where r.manage_token = p_token;
$$;

revoke all on function public.get_request_by_manage_token(uuid) from public;
grant execute on function public.get_request_by_manage_token(uuid) to anon, authenticated;

create or replace function public.list_responses_for_manage_token(p_token uuid)
returns table (
  response_id uuid,
  company_id uuid,
  company_name text,
  company_slug text,
  company_verified boolean,
  message text,
  status text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    rr.id,
    c.id,
    c.name,
    c.slug,
    coalesce(c.verified, false),
    rr.message,
    rr.status,
    rr.created_at
  from public.project_requests r
  join public.request_responses rr on rr.request_id = r.id
  join public.companies c on c.id = rr.company_id
  where r.manage_token = p_token
    and rr.status <> 'refunded'
  order by rr.created_at asc;
$$;

revoke all on function public.list_responses_for_manage_token(uuid) from public;
grant execute on function public.list_responses_for_manage_token(uuid) to anon, authenticated;

create or replace function public.close_project_request(p_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select r.id into v_id
  from public.project_requests r
  where r.manage_token = p_token
  for update;

  if v_id is null then
    raise exception 'Invalid manage link';
  end if;

  update public.project_requests
  set status = 'closed'
  where id = v_id
    and status = 'open';
end;
$$;

revoke all on function public.close_project_request(uuid) from public;
grant execute on function public.close_project_request(uuid) to anon, authenticated;

-- Mark buyer-viewed responses as seen
create or replace function public.mark_manage_responses_seen(p_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select r.id into v_id
  from public.project_requests r
  where r.manage_token = p_token;

  if v_id is null then
    return;
  end if;

  update public.request_responses
  set status = 'seen',
      seen_at = coalesce(seen_at, now())
  where request_id = v_id
    and status = 'sent';
end;
$$;

revoke all on function public.mark_manage_responses_seen(uuid) from public;
grant execute on function public.mark_manage_responses_seen(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- respond_to_request — atomic credit spend (FOR UPDATE)
-- ---------------------------------------------------------------------------

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

-- Contact only after paid response
create or replace function public.get_response_contact(p_response_id uuid)
returns table (
  requester_name text,
  requester_email text,
  requester_company text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
begin
  select rr.company_id into v_company_id
  from public.request_responses rr
  where rr.id = p_response_id
    and rr.credit_spent is true
    and rr.status <> 'refunded';

  if v_company_id is null then
    raise exception 'Response not found';
  end if;

  if not public.is_company_owner(v_company_id) then
    raise exception 'Not allowed';
  end if;

  return query
  select
    r.requester_name,
    r.requester_email,
    r.requester_company
  from public.request_responses rr
  join public.project_requests r on r.id = rr.request_id
  where rr.id = p_response_id;
end;
$$;

revoke all on function public.get_response_contact(uuid) from public, anon;
grant execute on function public.get_response_contact(uuid) to authenticated;

-- Company response history with contact (paid leads only)
create or replace function public.list_my_request_responses()
returns table (
  response_id uuid,
  request_id uuid,
  title text,
  category text,
  city text,
  message text,
  status text,
  created_at timestamptz,
  requester_name text,
  requester_email text,
  requester_company text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_company_id uuid;
begin
  if v_uid is null then
    return;
  end if;

  select c.id into v_company_id
  from public.companies c
  where c.owner_id = v_uid
    and c.claimed is true
  order by c.created_at asc
  limit 1;

  if v_company_id is null then
    return;
  end if;

  return query
  select
    rr.id,
    r.id,
    r.title,
    r.category,
    r.city,
    rr.message,
    rr.status,
    rr.created_at,
    r.requester_name,
    r.requester_email,
    r.requester_company
  from public.request_responses rr
  join public.project_requests r on r.id = rr.request_id
  where rr.company_id = v_company_id
    and rr.credit_spent is true
    and rr.status <> 'refunded'
  order by rr.created_at desc;
end;
$$;

revoke all on function public.list_my_request_responses() from public, anon;
grant execute on function public.list_my_request_responses() to authenticated;

-- ---------------------------------------------------------------------------
-- refund_response — service_role only (cron/admin later; TODO automate)
-- ---------------------------------------------------------------------------

create or replace function public.refund_response(p_response_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rr public.request_responses%rowtype;
  v_balance int;
begin
  -- TODO: cron — refund unseen responses after 7 days (status still 'sent').
  select rr.* into v_rr
  from public.request_responses rr
  where rr.id = p_response_id
  for update;

  if v_rr.id is null then
    raise exception 'Response not found';
  end if;

  if v_rr.status = 'refunded' or v_rr.credit_spent is not true then
    raise exception 'Response is not refundable';
  end if;

  -- Only unopened (sent) responses are refundable for now.
  if v_rr.status <> 'sent' then
    raise exception 'Only unopened responses can be refunded';
  end if;

  update public.request_responses
  set status = 'refunded'
  where id = v_rr.id;

  insert into public.company_credits (company_id, balance, updated_at)
  values (v_rr.company_id, 0, now())
  on conflict (company_id) do nothing;

  select cc.balance into v_balance
  from public.company_credits cc
  where cc.company_id = v_rr.company_id
  for update;

  update public.company_credits
  set balance = balance + 1,
      updated_at = now()
  where company_id = v_rr.company_id;

  insert into public.credit_ledger (
    company_id,
    delta,
    reason,
    reference_id
  )
  values (
    v_rr.company_id,
    1,
    'refund',
    v_rr.id
  );
end;
$$;

revoke all on function public.refund_response(uuid) from public;
revoke all on function public.refund_response(uuid) from anon, authenticated;
grant execute on function public.refund_response(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- admin_grant_credits — service_role / SQL console only (no Stripe yet)
-- Usage:
--   select public.admin_grant_credits('<company_uuid>', 15, 'admin');
-- ---------------------------------------------------------------------------

create or replace function public.admin_grant_credits(
  p_company_id uuid,
  p_amount int,
  p_reason text default 'admin'
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance int;
  v_reason text := coalesce(nullif(trim(p_reason), ''), 'admin');
begin
  if p_company_id is null then
    raise exception 'company_id is required';
  end if;
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
  values (p_company_id, 0, now())
  on conflict (company_id) do nothing;

  select cc.balance into v_balance
  from public.company_credits cc
  where cc.company_id = p_company_id
  for update;

  update public.company_credits
  set balance = balance + p_amount,
      updated_at = now()
  where company_id = p_company_id
  returning balance into v_balance;

  insert into public.credit_ledger (
    company_id,
    delta,
    reason,
    reference_id
  )
  values (
    p_company_id,
    p_amount,
    v_reason,
    null
  );

  return v_balance;
end;
$$;

revoke all on function public.admin_grant_credits(uuid, int, text) from public;
revoke all on function public.admin_grant_credits(uuid, int, text) from anon, authenticated;
grant execute on function public.admin_grant_credits(uuid, int, text) to service_role;

-- ---------------------------------------------------------------------------
-- Digest: enqueue + claim eligible emails (max 1/day per verified firm)
-- ---------------------------------------------------------------------------

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

  -- Enqueue verified + claimed firms matching category + city
  insert into public.request_digest_queue (company_id, request_id)
  select c.id, v_req.id
  from public.companies c
  where c.claimed is true
    and c.verified is true
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

-- Buyer notify after firm responds — manage_token never exposed to companies
create or replace function public.get_response_buyer_notify(p_response_id uuid)
returns table (
  requester_name text,
  requester_email text,
  request_title text,
  manage_token uuid,
  company_name text,
  company_slug text,
  message text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.requester_name,
    r.requester_email,
    r.title,
    r.manage_token,
    c.name,
    c.slug,
    rr.message
  from public.request_responses rr
  join public.project_requests r on r.id = rr.request_id
  join public.companies c on c.id = rr.company_id
  where rr.id = p_response_id
    and rr.status <> 'refunded';
$$;

revoke all on function public.get_response_buyer_notify(uuid) from public;
revoke all on function public.get_response_buyer_notify(uuid) from anon, authenticated;
grant execute on function public.get_response_buyer_notify(uuid) to service_role;
