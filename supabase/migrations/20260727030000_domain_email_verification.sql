-- Email domain verification tokens (address discovery path)

create table public.domain_verification_email_tokens (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  email text not null,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index domain_verification_email_tokens_hash_idx
  on public.domain_verification_email_tokens (token_hash)
  where used_at is null;

create index domain_verification_email_tokens_company_idx
  on public.domain_verification_email_tokens (company_id, created_at desc);

alter table public.domain_verification_email_tokens enable row level security;

revoke all on public.domain_verification_email_tokens from anon, authenticated;

create table public.domain_verification_discovery_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  ip_hash text,
  website_domain text not null,
  address_count int not null default 0,
  created_at timestamptz not null default now()
);

create index domain_verification_discovery_log_company_idx
  on public.domain_verification_discovery_log (company_id, created_at desc);

alter table public.domain_verification_discovery_log enable row level security;
revoke all on public.domain_verification_discovery_log from anon, authenticated;

create table public.domain_verification_email_send_limits (
  email text primary key,
  window_start timestamptz not null,
  send_count int not null default 0
);

alter table public.domain_verification_email_send_limits enable row level security;
revoke all on public.domain_verification_email_send_limits from anon, authenticated;

create table public.domain_verification_ip_limits (
  ip_hash text not null,
  action text not null check (action in ('discovery', 'send')),
  window_start timestamptz not null,
  action_count int not null default 0,
  primary key (ip_hash, action)
);

alter table public.domain_verification_ip_limits enable row level security;
revoke all on public.domain_verification_ip_limits from anon, authenticated;

create table public.domain_verification_discovery_limits (
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  window_start timestamptz not null,
  attempt_count int not null default 0,
  primary key (user_id, company_id)
);

alter table public.domain_verification_discovery_limits enable row level security;
revoke all on public.domain_verification_discovery_limits from anon, authenticated;

-- Discovery: 10 / hour per user+company, 30 / hour per IP
create or replace function public.allow_domain_email_discovery(
  p_company_id uuid,
  p_ip_hash text default null,
  p_claim_token uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_start timestamptz;
  v_count int;
  v_allowed boolean := false;
begin
  if v_uid is null then
    raise exception 'Not allowed';
  end if;

  if public.is_company_owner(p_company_id) then
    v_allowed := true;
  elsif p_claim_token is not null and exists (
    select 1 from public.companies c
    where c.id = p_company_id
      and c.claim_token = p_claim_token
      and c.claimed = false
  ) then
    v_allowed := true;
  end if;

  if not v_allowed then
    raise exception 'Not allowed';
  end if;

  insert into public.domain_verification_discovery_limits (user_id, company_id, window_start, attempt_count)
  values (v_uid, p_company_id, now(), 0)
  on conflict (user_id, company_id) do nothing;

  select window_start, attempt_count
  into v_start, v_count
  from public.domain_verification_discovery_limits
  where user_id = v_uid and company_id = p_company_id
  for update;

  if v_start is null or v_start < now() - interval '1 hour' then
    update public.domain_verification_discovery_limits
    set window_start = now(), attempt_count = 1
    where user_id = v_uid and company_id = p_company_id;
  elsif v_count >= 10 then
    return false;
  else
    update public.domain_verification_discovery_limits
    set attempt_count = attempt_count + 1
    where user_id = v_uid and company_id = p_company_id;
  end if;

  if p_ip_hash is not null and length(trim(p_ip_hash)) > 0 then
    insert into public.domain_verification_ip_limits (ip_hash, action, window_start, action_count)
    values (p_ip_hash, 'discovery', now(), 0)
    on conflict (ip_hash, action) do nothing;

    select window_start, action_count
    into v_start, v_count
    from public.domain_verification_ip_limits
    where ip_hash = p_ip_hash and action = 'discovery'
    for update;

    if v_start is null or v_start < now() - interval '1 hour' then
      update public.domain_verification_ip_limits
      set window_start = now(), action_count = 1
      where ip_hash = p_ip_hash and action = 'discovery';
    elsif v_count >= 30 then
      return false;
    else
      update public.domain_verification_ip_limits
      set action_count = action_count + 1
      where ip_hash = p_ip_hash and action = 'discovery';
    end if;
  end if;

  return true;
end;
$$;

revoke all on function public.allow_domain_email_discovery(uuid, text, uuid) from public;
grant execute on function public.allow_domain_email_discovery(uuid, text, uuid) to authenticated;

create or replace function public.log_domain_email_discovery(
  p_company_id uuid,
  p_ip_hash text,
  p_website_domain text,
  p_address_count int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.domain_verification_discovery_log (
    company_id, user_id, ip_hash, website_domain, address_count
  )
  values (
    p_company_id,
    auth.uid(),
    nullif(trim(p_ip_hash), ''),
    trim(p_website_domain),
    greatest(0, coalesce(p_address_count, 0))
  );
end;
$$;

revoke all on function public.log_domain_email_discovery(uuid, text, text, int) from public;
grant execute on function public.log_domain_email_discovery(uuid, text, text, int) to authenticated;

-- Send: 3 / hour per target email, 20 / hour per IP (company limit via record_verification_attempt)
create or replace function public.allow_domain_verification_email_send(
  p_company_id uuid,
  p_email text,
  p_ip_hash text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_start timestamptz;
  v_count int;
begin
  if auth.uid() is null or not public.is_company_owner(p_company_id) then
    raise exception 'Not allowed';
  end if;

  insert into public.domain_verification_email_send_limits (email, window_start, send_count)
  values (v_email, now(), 0)
  on conflict (email) do nothing;

  select window_start, send_count
  into v_start, v_count
  from public.domain_verification_email_send_limits
  where email = v_email
  for update;

  if v_start is null or v_start < now() - interval '1 hour' then
    update public.domain_verification_email_send_limits
    set window_start = now(), send_count = 1
    where email = v_email;
  elsif v_count >= 3 then
    return false;
  else
    update public.domain_verification_email_send_limits
    set send_count = send_count + 1
    where email = v_email;
  end if;

  if p_ip_hash is not null and length(trim(p_ip_hash)) > 0 then
    insert into public.domain_verification_ip_limits (ip_hash, action, window_start, action_count)
    values (p_ip_hash, 'send', now(), 0)
    on conflict (ip_hash, action) do nothing;

    select window_start, action_count
    into v_start, v_count
    from public.domain_verification_ip_limits
    where ip_hash = p_ip_hash and action = 'send'
    for update;

    if v_start is null or v_start < now() - interval '1 hour' then
      update public.domain_verification_ip_limits
      set window_start = now(), action_count = 1
      where ip_hash = p_ip_hash and action = 'send';
    elsif v_count >= 20 then
      return false;
    else
      update public.domain_verification_ip_limits
      set action_count = action_count + 1
      where ip_hash = p_ip_hash and action = 'send';
    end if;
  end if;

  return true;
end;
$$;

revoke all on function public.allow_domain_verification_email_send(uuid, text, text) from public;
grant execute on function public.allow_domain_verification_email_send(uuid, text, text) to authenticated;

create or replace function public.issue_domain_verification_email_token(
  p_company_id uuid,
  p_email text,
  p_token_hash text,
  p_expires_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_company_owner(p_company_id) then
    raise exception 'Not allowed';
  end if;

  update public.domain_verification_email_tokens
  set used_at = now()
  where company_id = p_company_id
    and used_at is null;

  insert into public.domain_verification_email_tokens (
    company_id, email, token_hash, expires_at
  )
  values (
    p_company_id,
    lower(trim(p_email)),
    p_token_hash,
    p_expires_at
  );
end;
$$;

revoke all on function public.issue_domain_verification_email_token(uuid, text, text, timestamptz) from public;
grant execute on function public.issue_domain_verification_email_token(uuid, text, text, timestamptz) to authenticated;

create or replace function public.consume_domain_verification_email_token(p_token_hash text)
returns table (company_id uuid, company_slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.domain_verification_email_tokens;
begin
  select * into v_row
  from public.domain_verification_email_tokens t
  where t.token_hash = p_token_hash
    and t.used_at is null
    and t.expires_at > now()
  for update;

  if v_row.id is null then
    raise exception 'Invalid or expired verification link';
  end if;

  update public.domain_verification_email_tokens
  set used_at = now()
  where id = v_row.id;

  perform set_config('linken.allow_verified_write', 'on', true);
  perform public.set_domain_verified(v_row.company_id, 'email_domain');

  return query
  select c.id, c.slug
  from public.companies c
  where c.id = v_row.company_id;
end;
$$;

revoke all on function public.consume_domain_verification_email_token(text) from public;
grant execute on function public.consume_domain_verification_email_token(text) to service_role;
