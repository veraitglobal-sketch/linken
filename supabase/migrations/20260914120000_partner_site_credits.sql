-- Directional HTML partner credits detected on a publisher homepage.
-- Writes only from the server (service role). Public proof is readable.

create table public.partner_site_credits (
  id uuid primary key default gen_random_uuid(),
  partnership_id uuid not null references public.partnerships (id) on delete cascade,
  publisher_id uuid not null references public.companies (id) on delete cascade,
  credited_id uuid not null references public.companies (id) on delete cascade,
  href text not null,
  detected_at timestamptz not null default now(),
  last_checked_at timestamptz not null default now(),
  constraint partner_site_credits_not_self check (publisher_id <> credited_id),
  constraint partner_site_credits_pair_unique unique (partnership_id, publisher_id),
  constraint partner_site_credits_href_len check (
    char_length(href) between 8 and 2048
  )
);

create index partner_site_credits_credited_idx
  on public.partner_site_credits (credited_id);

create index partner_site_credits_publisher_idx
  on public.partner_site_credits (publisher_id);

comment on table public.partner_site_credits is
  'HTML partner credits on a publisher site. Detected on demand; service-role writes.';

alter table public.partner_site_credits enable row level security;

create policy "partner_site_credits_public_select"
on public.partner_site_credits for select
to anon, authenticated
using (true);

revoke all on table public.partner_site_credits from public, anon, authenticated;
grant select (
  id,
  partnership_id,
  publisher_id,
  credited_id,
  href,
  detected_at,
  last_checked_at
) on public.partner_site_credits to anon, authenticated;

create table public.partner_credit_check_limits (
  company_id uuid primary key references public.companies (id) on delete cascade,
  check_window_start timestamptz,
  check_count int not null default 0
);

alter table public.partner_credit_check_limits enable row level security;
revoke all on table public.partner_credit_check_limits from public, anon, authenticated;

create or replace function public.record_partner_credit_attempt(p_company_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz;
  v_count int;
begin
  if auth.uid() is null or not public.is_company_operator(p_company_id) then
    raise exception 'Not allowed';
  end if;

  insert into public.partner_credit_check_limits (company_id)
  values (p_company_id)
  on conflict (company_id) do nothing;

  select check_window_start, check_count
  into v_start, v_count
  from public.partner_credit_check_limits
  where company_id = p_company_id
  for update;

  if v_start is null or v_start < now() - interval '1 hour' then
    update public.partner_credit_check_limits
    set check_window_start = now(),
        check_count = 1
    where company_id = p_company_id;
    return true;
  end if;

  if v_count >= 5 then
    return false;
  end if;

  update public.partner_credit_check_limits
  set check_count = check_count + 1
  where company_id = p_company_id;

  return true;
end;
$$;

revoke all on function public.record_partner_credit_attempt(uuid) from public;
grant execute on function public.record_partner_credit_attempt(uuid) to authenticated;
