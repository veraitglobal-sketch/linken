-- Ranking: one row per company with the points behind its position.
--
-- The numbers are derived, never typed in: the server recomputes a company from
-- its confirmed rows and writes the result through the RPC below. Nothing here
-- reads a plan — a position cannot be bought.
--
-- Reads are public, because the ranking pages are public and so is every record
-- that produced them.

create table public.company_rank (
  company_id uuid primary key references public.companies (id) on delete cascade,
  category_slug text references public.categories (slug),
  country_code text,
  points numeric not null default 0,
  distinct_partners int not null default 0,
  confirmed_records int not null default 0,
  last_confirmed_at timestamptz,
  computed_at timestamptz not null default now()
);

create index company_rank_category_points_idx
  on public.company_rank (category_slug, points desc, company_id);
create index company_rank_category_country_points_idx
  on public.company_rank (category_slug, country_code, points desc, company_id);

alter table public.company_rank enable row level security;

create policy company_rank_public_select
  on public.company_rank for select
  using (true);

revoke all on public.company_rank from anon, authenticated;
grant select on public.company_rank to anon, authenticated;

/**
 * Write one company's computed ranking. Service role only: the values come from
 * the server after it has read the confirmed rows, so no client may set them.
 */
create or replace function public.upsert_company_rank(
  p_company_id uuid,
  p_category_slug text,
  p_country_code text,
  p_points numeric,
  p_distinct_partners int,
  p_confirmed_records int,
  p_last_confirmed_at timestamptz
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_points < 0 or p_distinct_partners < 0 or p_confirmed_records < 0 then
    raise exception 'Ranking values cannot be negative';
  end if;

  insert into public.company_rank as r (
    company_id, category_slug, country_code, points,
    distinct_partners, confirmed_records, last_confirmed_at, computed_at
  )
  values (
    p_company_id, p_category_slug, p_country_code, p_points,
    p_distinct_partners, p_confirmed_records, p_last_confirmed_at, now()
  )
  on conflict (company_id) do update set
    category_slug = excluded.category_slug,
    country_code = excluded.country_code,
    points = excluded.points,
    distinct_partners = excluded.distinct_partners,
    confirmed_records = excluded.confirmed_records,
    last_confirmed_at = excluded.last_confirmed_at,
    computed_at = now()
  where r.company_id = p_company_id;
end;
$$;

revoke all on function public.upsert_company_rank(uuid, text, text, numeric, int, int, timestamptz) from public;
grant execute on function public.upsert_company_rank(uuid, text, text, numeric, int, int, timestamptz) to service_role;
