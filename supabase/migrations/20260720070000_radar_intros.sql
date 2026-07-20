-- Linken Radar Intros (outbound InMail).
-- Profile inquiries stay separate forever. Intros cost 2 Radar credits.

-- ---------------------------------------------------------------------------
-- Company controls
-- ---------------------------------------------------------------------------

alter table public.companies
  add column if not exists receive_intros boolean not null default true;

alter table public.companies
  add column if not exists intro_suspended_until timestamptz;

-- Default receive_intros from accepting_clients at migration time
update public.companies
set receive_intros = coalesce(accepting_clients, true)
where true;

-- receive_intros: dashboard + Radar search (authenticated). Not a public badge.
grant select (receive_intros) on public.companies to authenticated;
-- intro_suspended_until: owner/dashboard only (same as radar)
grant select (intro_suspended_until) on public.companies to authenticated;

-- Ledger reasons for intro spend + quality flags
alter table public.credit_ledger
  drop constraint if exists credit_ledger_reason_check;

alter table public.credit_ledger
  add constraint credit_ledger_reason_check
  check (reason in (
    'monthly_grant', 'response', 'refund', 'purchase', 'admin',
    'intro', 'intro_not_relevant'
  ));

-- ---------------------------------------------------------------------------
-- intros
-- ---------------------------------------------------------------------------

create table public.intros (
  id uuid primary key default gen_random_uuid(),
  sender_company_id uuid not null references public.companies (id) on delete cascade,
  recipient_company_id uuid not null references public.companies (id) on delete cascade,
  offer text not null,
  why_relevant text not null,
  message text not null,
  status text not null default 'sent'
    check (status in ('sent', 'seen', 'replied', 'not_relevant')),
  created_at timestamptz not null default now(),
  constraint intros_not_self check (sender_company_id <> recipient_company_id)
);

create index intros_sender_idx
  on public.intros (sender_company_id, created_at desc);

create index intros_recipient_idx
  on public.intros (recipient_company_id, created_at desc);

alter table public.intros enable row level security;

create policy "intros_sender_select"
on public.intros for select
to authenticated
using (public.is_company_owner(sender_company_id));

create policy "intros_recipient_select"
on public.intros for select
to authenticated
using (public.is_company_owner(recipient_company_id));

revoke all on table public.intros from public;
revoke all on table public.intros from anon, authenticated;

grant select (
  id, sender_company_id, recipient_company_id,
  offer, why_relevant, message, status, created_at
) on table public.intros to authenticated;

-- ---------------------------------------------------------------------------
-- search_radar_companies — claimed + verified only; public columns
-- ---------------------------------------------------------------------------

create or replace function public.search_radar_companies(
  p_category text default '',
  p_country text default '',
  p_city text default '',
  p_accepting_clients boolean default null,
  p_limit int default 40
)
returns table (
  id uuid,
  slug text,
  name text,
  category text,
  city text,
  country text,
  verified boolean,
  accepting_clients boolean,
  receive_intros boolean,
  website text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.slug,
    c.name,
    c.category,
    c.city,
    c.country,
    coalesce(c.verified, false),
    coalesce(c.accepting_clients, true),
    coalesce(c.receive_intros, true),
    coalesce(c.website, '')
  from public.companies c
  where c.claimed is true
    and c.verified is true
    and (trim(p_category) = '' or lower(c.category) = lower(trim(p_category)))
    and (trim(p_country) = '' or lower(c.country) = lower(trim(p_country)))
    and (trim(p_city) = '' or lower(c.city) = lower(trim(p_city)))
    and (
      p_accepting_clients is null
      or coalesce(c.accepting_clients, true) = p_accepting_clients
    )
  order by c.name asc
  limit greatest(1, least(coalesce(p_limit, 40), 60));
$$;

revoke all on function public.search_radar_companies(text, text, text, boolean, int)
  from public, anon;
grant execute on function public.search_radar_companies(text, text, text, boolean, int)
  to authenticated;

-- ---------------------------------------------------------------------------
-- send_intro — 2 credits, atomic
-- ---------------------------------------------------------------------------

create or replace function public.send_intro(
  p_recipient_company_id uuid,
  p_offer text,
  p_why_relevant text,
  p_message text
)
returns table (
  intro_id uuid,
  credit_balance int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_sender public.companies%rowtype;
  v_recipient public.companies%rowtype;
  v_offer text := trim(p_offer);
  v_why text := trim(p_why_relevant);
  v_message text := trim(p_message);
  v_balance int;
  v_intro_id uuid;
  v_cost int := 2;
begin
  if v_uid is null then
    raise exception 'Sign in required';
  end if;

  if char_length(v_offer) < 5 then
    raise exception 'Offer must be at least 5 characters';
  end if;
  if char_length(v_why) < 10 then
    raise exception 'Why relevant must be at least 10 characters';
  end if;
  if char_length(v_message) < 20 then
    raise exception 'Message must be at least 20 characters';
  end if;

  select c.* into v_sender
  from public.companies c
  where c.owner_id = v_uid
    and c.claimed is true
  order by c.created_at asc
  limit 1;

  if v_sender.id is null then
    raise exception 'Company not found';
  end if;

  if v_sender.radar is not true then
    raise exception 'Radar — coming soon';
  end if;

  if v_sender.verified is not true then
    raise exception 'Verify your domain to send intros';
  end if;

  if v_sender.intro_suspended_until is not null
     and v_sender.intro_suspended_until > now() then
    raise exception 'Intro privilege suspended until %',
      v_sender.intro_suspended_until::date;
  end if;

  select c.* into v_recipient
  from public.companies c
  where c.id = p_recipient_company_id
  for share;

  if v_recipient.id is null then
    raise exception 'Recipient not found';
  end if;

  if v_recipient.id = v_sender.id then
    raise exception 'Cannot intro your own company';
  end if;

  if v_recipient.claimed is not true or v_recipient.verified is not true then
    raise exception 'Recipient must be claimed and verified';
  end if;

  if v_recipient.receive_intros is not true then
    raise exception 'This company is not accepting intros';
  end if;

  if exists (
    select 1 from public.intros i
    where i.sender_company_id = v_sender.id
      and i.recipient_company_id = v_recipient.id
      and i.status in ('sent', 'seen')
  ) then
    raise exception 'You already have an open intro to this company';
  end if;

  insert into public.company_credits (company_id, balance, updated_at)
  values (v_sender.id, 0, now())
  on conflict (company_id) do nothing;

  select cc.balance into v_balance
  from public.company_credits cc
  where cc.company_id = v_sender.id
  for update;

  if v_balance is null or v_balance < v_cost then
    raise exception 'Insufficient credits';
  end if;

  update public.company_credits
  set balance = balance - v_cost,
      updated_at = now()
  where company_id = v_sender.id
  returning balance into v_balance;

  insert into public.intros (
    sender_company_id,
    recipient_company_id,
    offer,
    why_relevant,
    message,
    status
  )
  values (
    v_sender.id,
    v_recipient.id,
    v_offer,
    v_why,
    v_message,
    'sent'
  )
  returning id into v_intro_id;

  insert into public.credit_ledger (
    company_id, delta, reason, reference_id
  )
  values (
    v_sender.id, -v_cost, 'intro', v_intro_id
  );

  return query select v_intro_id as intro_id, v_balance as credit_balance;
end;
$$;

revoke all on function public.send_intro(uuid, text, text, text) from public, anon;
grant execute on function public.send_intro(uuid, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- mark_intro_not_relevant — quality signal + suspension
-- ---------------------------------------------------------------------------

create or replace function public.mark_intro_not_relevant(p_intro_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_intro public.intros%rowtype;
  v_flags int;
begin
  select i.* into v_intro
  from public.intros i
  where i.id = p_intro_id
  for update;

  if v_intro.id is null then
    raise exception 'Intro not found';
  end if;

  if not public.is_company_owner(v_intro.recipient_company_id) then
    raise exception 'Not allowed';
  end if;

  if v_intro.status = 'not_relevant' then
    return;
  end if;

  update public.intros
  set status = 'not_relevant'
  where id = v_intro.id;

  -- Audit only (no credit refund — quality signal)
  insert into public.credit_ledger (
    company_id, delta, reason, reference_id
  )
  values (
    v_intro.sender_company_id, 0, 'intro_not_relevant', v_intro.id
  );

  select count(*)::int into v_flags
  from public.intros i
  where i.sender_company_id = v_intro.sender_company_id
    and i.status = 'not_relevant'
    and i.created_at > now() - interval '30 days';

  if v_flags >= 3 then
    update public.companies
    set intro_suspended_until = now() + interval '30 days'
    where id = v_intro.sender_company_id;
  end if;
end;
$$;

revoke all on function public.mark_intro_not_relevant(uuid) from public, anon;
grant execute on function public.mark_intro_not_relevant(uuid) to authenticated;

create or replace function public.mark_intro_seen(p_intro_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient uuid;
begin
  select i.recipient_company_id into v_recipient
  from public.intros i
  where i.id = p_intro_id;

  if v_recipient is null then
    return;
  end if;

  if not public.is_company_owner(v_recipient) then
    raise exception 'Not allowed';
  end if;

  update public.intros
  set status = 'seen'
  where id = p_intro_id
    and status = 'sent';
end;
$$;

revoke all on function public.mark_intro_seen(uuid) from public, anon;
grant execute on function public.mark_intro_seen(uuid) to authenticated;

-- Toggle receive_intros (recipient control)
create or replace function public.set_receive_intros(p_enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_company_id uuid;
begin
  if v_uid is null then
    raise exception 'Sign in required';
  end if;

  select c.id into v_company_id
  from public.companies c
  where c.owner_id = v_uid
    and c.claimed is true
  order by c.created_at asc
  limit 1;

  if v_company_id is null then
    raise exception 'Company not found';
  end if;

  update public.companies
  set receive_intros = coalesce(p_enabled, true)
  where id = v_company_id;
end;
$$;

revoke all on function public.set_receive_intros(boolean) from public, anon;
grant execute on function public.set_receive_intros(boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Notify / reply contact — never via table SELECT
-- ---------------------------------------------------------------------------

create or replace function public.get_intro_notify_email(p_intro_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(trim(u.email), ''),
    nullif(trim(c.invite_email), '')
  )
  from public.intros i
  join public.companies c on c.id = i.recipient_company_id
  left join auth.users u on u.id = c.owner_id
  where i.id = p_intro_id;
$$;

revoke all on function public.get_intro_notify_email(uuid) from public;
revoke all on function public.get_intro_notify_email(uuid) from anon, authenticated;
grant execute on function public.get_intro_notify_email(uuid) to service_role;

-- Safer than exposing owner email on companies: recipient-only, after intro received.
create or replace function public.get_intro_sender_reply_email(p_intro_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_recipient uuid;
  v_email text;
begin
  select i.recipient_company_id into v_recipient
  from public.intros i
  where i.id = p_intro_id;

  if v_recipient is null then
    raise exception 'Intro not found';
  end if;

  if not public.is_company_owner(v_recipient) then
    raise exception 'Not allowed';
  end if;

  select coalesce(
    nullif(trim(u.email), ''),
    nullif(trim(c.invite_email), '')
  )
  into v_email
  from public.intros i
  join public.companies c on c.id = i.sender_company_id
  left join auth.users u on u.id = c.owner_id
  where i.id = p_intro_id;

  return v_email;
end;
$$;

revoke all on function public.get_intro_sender_reply_email(uuid) from public, anon;
grant execute on function public.get_intro_sender_reply_email(uuid) to authenticated;
