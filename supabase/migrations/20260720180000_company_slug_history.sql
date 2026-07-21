-- Allow owners to change their public handle (like an @username) — but
-- never break a link that's already out in the world (QR codes, embeds on
-- other sites, printed one-pagers). Old slug redirects to the new one.

create table public.company_slug_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  old_slug text not null unique,
  changed_at timestamptz not null default now()
);

create index company_slug_history_company_idx
  on public.company_slug_history (company_id);

alter table public.company_slug_history enable row level security;

-- Public read: the redirect resolver needs this from anon requests.
create policy "slug_history_public_select"
on public.company_slug_history for select
using (true);

revoke insert, update, delete on public.company_slug_history from anon, authenticated;
grant select on public.company_slug_history to anon, authenticated;

-- Rate limit bookkeeping on companies (mirrors logo_refresh_* pattern).
alter table public.companies
  add column if not exists slug_changed_at timestamptz,
  add column if not exists slug_change_count int not null default 0;

grant select (slug_changed_at, slug_change_count) on public.companies to authenticated;

-- ---------------------------------------------------------------------------
-- update_company_slug — operator only, rate-limited, keeps a redirect record
-- ---------------------------------------------------------------------------

create or replace function public.update_company_slug(
  p_company_id uuid,
  p_new_slug text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_slug text;
  v_new_slug text := lower(trim(p_new_slug));
  v_last_change timestamptz;
  v_count int;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_company_operator(p_company_id) then
    raise exception 'Not allowed';
  end if;

  if v_new_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(v_new_slug) < 3
     or length(v_new_slug) > 60 then
    raise exception 'Handle must be lowercase letters, numbers, and hyphens (3-60 characters).';
  end if;

  -- reserved paths that would collide with real routes
  if v_new_slug in (
    'search','login','onboarding','dashboard','api','auth','embed',
    'developers','claim','confirm','confirm-reference','transfer','join',
    'welcome','requests','g','c','sitemap.xml','robots.txt','llms.txt'
  ) then
    raise exception 'That handle is reserved.';
  end if;

  select slug, slug_changed_at, slug_change_count
  into v_old_slug, v_last_change, v_count
  from public.companies
  where id = p_company_id
  for update;

  if v_old_slug is null then
    raise exception 'Company not found';
  end if;

  if v_old_slug = v_new_slug then
    return v_old_slug;
  end if;

  if v_last_change is not null and v_last_change > now() - interval '14 days' then
    raise exception 'You can change your handle again in a few days (once every 14 days).';
  end if;

  if v_count >= 12 then
    raise exception 'Handle change limit reached — contact support.';
  end if;

  if exists (select 1 from public.companies where slug = v_new_slug) then
    raise exception 'That handle is taken.';
  end if;
  if exists (select 1 from public.company_slug_history where old_slug = v_new_slug) then
    raise exception 'That handle was used before and now redirects elsewhere.';
  end if;

  insert into public.company_slug_history (company_id, old_slug)
  values (p_company_id, v_old_slug);

  update public.companies
  set slug = v_new_slug,
      slug_changed_at = now(),
      slug_change_count = v_count + 1
  where id = p_company_id;

  return v_new_slug;
end;
$$;

revoke all on function public.update_company_slug(uuid, text) from public;
grant execute on function public.update_company_slug(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- resolve_company_slug_redirect — anon-callable, old slug → current slug
-- ---------------------------------------------------------------------------

create or replace function public.resolve_company_slug_redirect(p_old_slug text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select c.slug
  from public.company_slug_history h
  join public.companies c on c.id = h.company_id
  where h.old_slug = lower(trim(p_old_slug))
  order by h.changed_at desc
  limit 1;
$$;

revoke all on function public.resolve_company_slug_redirect(text) from public;
grant execute on function public.resolve_company_slug_redirect(text) to anon, authenticated;
