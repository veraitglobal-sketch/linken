-- Widget placement telemetry: where embeds actually render.
-- Writes only via security definer RPC (service_role). Owners may SELECT.

create table public.widget_placements (
  company_id uuid not null references public.companies (id) on delete cascade,
  host text not null,
  variant text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  render_count bigint not null default 0,
  primary key (company_id, host, variant),
  constraint widget_placements_host_len check (
    char_length(host) between 1 and 253
  ),
  constraint widget_placements_variant_len check (
    char_length(variant) between 1 and 40
  )
);

create index widget_placements_company_seen_idx
  on public.widget_placements (company_id, last_seen_at desc);

alter table public.widget_placements enable row level security;

create policy "widget_placements_owner_select"
on public.widget_placements for select
to authenticated
using (public.is_company_owner(company_id));

revoke all on table public.widget_placements from public, anon, authenticated;
grant select (
  company_id, host, variant, first_seen_at, last_seen_at, render_count
) on public.widget_placements to authenticated;

create or replace function public.record_widget_placement(
  p_company_id uuid,
  p_host text,
  p_variant text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_host text := lower(trim(p_host));
  v_variant text := lower(trim(p_variant));
begin
  if p_company_id is null then
    raise exception 'company_id required';
  end if;
  if v_host = '' or char_length(v_host) > 253 then
    raise exception 'invalid host';
  end if;
  if v_variant = '' or char_length(v_variant) > 40 then
    raise exception 'invalid variant';
  end if;

  insert into public.widget_placements as wp (
    company_id, host, variant, first_seen_at, last_seen_at, render_count
  )
  values (p_company_id, v_host, v_variant, now(), now(), 1)
  on conflict (company_id, host, variant) do update
  set
    last_seen_at = now(),
    render_count = wp.render_count + 1;
end;
$$;

revoke all on function public.record_widget_placement(uuid, text, text) from public;
grant execute on function public.record_widget_placement(uuid, text, text)
  to service_role;

comment on table public.widget_placements is
  'Embed render hosts. Upserted only by record_widget_placement (service_role).';
