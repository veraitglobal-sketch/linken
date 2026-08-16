-- Developer partner commissions: 10% of paid invoices from referred companies.
-- Accrue-only; writes only via security definer RPC (service_role).

create table public.partner_commissions (
  id uuid primary key default gen_random_uuid(),
  referrer_company_id uuid not null references public.companies (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  stripe_invoice_id text not null,
  invoice_total_cents integer not null,
  commission_cents integer not null,
  currency text not null,
  status text not null default 'accrued',
  created_at timestamptz not null default now(),
  constraint partner_commissions_stripe_invoice_id_key unique (stripe_invoice_id),
  constraint partner_commissions_invoice_total_nonneg check (invoice_total_cents >= 0),
  constraint partner_commissions_commission_nonneg check (commission_cents >= 0),
  constraint partner_commissions_status_check check (status in ('accrued'))
);

create index partner_commissions_referrer_created_idx
  on public.partner_commissions (referrer_company_id, created_at desc);

create index partner_commissions_referrer_company_idx
  on public.partner_commissions (referrer_company_id, company_id);

comment on table public.partner_commissions is
  '10% recurring commission on paid Stripe invoices from referred companies. Accrue-only; no payouts.';

-- Referrers need this column to list their book (never grant to anon).
grant select (referred_by_company_id) on public.companies to authenticated;

-- Partner dashboard: see which widgets a referred client has live.
create policy "widget_placements_referrer_select"
on public.widget_placements for select
to authenticated
using (
  exists (
    select 1
    from public.companies c
    where c.id = company_id
      and c.referred_by_company_id is not null
      and public.is_company_operator(c.referred_by_company_id)
  )
);

alter table public.partner_commissions enable row level security;

create policy "partner_commissions_referrer_select"
on public.partner_commissions for select
to authenticated
using (public.is_company_operator(referrer_company_id));

revoke all on table public.partner_commissions from public, anon, authenticated;
grant select (
  id,
  referrer_company_id,
  company_id,
  stripe_invoice_id,
  invoice_total_cents,
  commission_cents,
  currency,
  status,
  created_at
) on public.partner_commissions to authenticated;

create or replace function public.accrue_partner_commission(
  p_referrer_company_id uuid,
  p_company_id uuid,
  p_stripe_invoice_id text,
  p_invoice_total_cents integer,
  p_commission_cents integer,
  p_currency text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_invoice text := nullif(trim(p_stripe_invoice_id), '');
  v_currency text := lower(nullif(trim(p_currency), ''));
begin
  if p_referrer_company_id is null or p_company_id is null then
    raise exception 'company ids required';
  end if;
  if p_referrer_company_id = p_company_id then
    raise exception 'self-referral not allowed';
  end if;
  if v_invoice is null or char_length(v_invoice) > 255 then
    raise exception 'invalid stripe_invoice_id';
  end if;
  if p_invoice_total_cents is null or p_invoice_total_cents < 0 then
    raise exception 'invalid invoice_total_cents';
  end if;
  if p_commission_cents is null or p_commission_cents < 0 then
    raise exception 'invalid commission_cents';
  end if;
  if v_currency is null or char_length(v_currency) > 16 then
    raise exception 'invalid currency';
  end if;

  insert into public.partner_commissions (
    referrer_company_id,
    company_id,
    stripe_invoice_id,
    invoice_total_cents,
    commission_cents,
    currency,
    status
  )
  values (
    p_referrer_company_id,
    p_company_id,
    v_invoice,
    p_invoice_total_cents,
    p_commission_cents,
    v_currency,
    'accrued'
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.accrue_partner_commission(
  uuid, uuid, text, integer, integer, text
) from public;
grant execute on function public.accrue_partner_commission(
  uuid, uuid, text, integer, integer, text
) to service_role;

comment on function public.accrue_partner_commission(
  uuid, uuid, text, integer, integer, text
) is
  'Insert one accrued commission row. Unique stripe_invoice_id makes redeliveries fail with 23505.';
