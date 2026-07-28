-- Duplicate merge: soft-mark fallback when a loser company cannot be hard
-- deleted (FK references outside the tables the merge action repoints).

alter table public.companies
  add column if not exists merged_into_company_id uuid
    references public.companies (id) on delete set null;

create index if not exists companies_merged_into_idx
  on public.companies (merged_into_company_id)
  where merged_into_company_id is not null;

comment on column public.companies.merged_into_company_id is
  'Set by admin duplicate-merge when the loser row could not be hard-deleted. Never exposed to anon/authenticated.';

-- Bypass companies_protect_identity_fields for slug rename during merge.
create or replace function public.admin_soft_mark_merged_company(
  p_loser_id uuid,
  p_winner_id uuid,
  p_merged_slug text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_loser_id is null or p_winner_id is null then
    raise exception 'winner and loser are required';
  end if;
  if p_loser_id = p_winner_id then
    raise exception 'winner and loser must differ';
  end if;
  if coalesce(trim(p_merged_slug), '') = '' then
    raise exception 'merged slug is required';
  end if;

  perform set_config('linken.allow_identity_write', 'on', true);

  update public.companies
  set merged_into_company_id = p_winner_id,
      slug = p_merged_slug
  where id = p_loser_id;
end;
$$;

revoke all on function public.admin_soft_mark_merged_company(uuid, uuid, text) from public;
revoke all on function public.admin_soft_mark_merged_company(uuid, uuid, text) from anon, authenticated;
grant execute on function public.admin_soft_mark_merged_company(uuid, uuid, text) to service_role;
