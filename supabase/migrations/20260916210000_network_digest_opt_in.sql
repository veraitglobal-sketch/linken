-- Weekly network digest (opt-in): profile + embed activity for confirmed companies.

alter table public.companies
  add column if not exists network_digest_opt_in boolean not null default false;

alter table public.companies
  add column if not exists network_digest_last_sent_at timestamptz;

comment on column public.companies.network_digest_opt_in is
  'Owner opted into the weekly confirmed-network digest email.';

comment on column public.companies.network_digest_last_sent_at is
  'Last successful network digest send (service role / cron).';

revoke all on column public.companies.network_digest_opt_in from anon;
revoke all on column public.companies.network_digest_last_sent_at from anon;
revoke all on column public.companies.network_digest_last_sent_at from authenticated;

grant select (network_digest_opt_in) on public.companies to authenticated;

create or replace function public.set_network_digest_opt_in(
  p_company_id uuid,
  p_opt_in boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_company_id is null or not public.is_company_owner(p_company_id) then
    raise exception 'Not company owner';
  end if;

  update public.companies
  set network_digest_opt_in = coalesce(p_opt_in, false)
  where id = p_company_id
    and claimed = true;

  if not found then
    raise exception 'Company not found';
  end if;

  return coalesce(p_opt_in, false);
end;
$$;

revoke all on function public.set_network_digest_opt_in(uuid, boolean) from public;
grant execute on function public.set_network_digest_opt_in(uuid, boolean) to authenticated;
