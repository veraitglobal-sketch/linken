-- Inquiries: private lead channel from public company profiles

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  sender_name text not null,
  sender_email text not null,
  sender_company text not null default '',
  message text not null,
  service_interest text not null default '',
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

create index inquiries_company_idx
  on public.inquiries (company_id, created_at desc);

alter table public.inquiries enable row level security;

-- Private: only the receiving company owner may read
create policy "inquiries_owner_select"
on public.inquiries for select
to authenticated
using (public.is_company_owner(company_id));

-- No direct INSERT for anyone: a direct REST insert would bypass the
-- rate limit in create_inquiry. The security definer function below is
-- the only write path (it does not need caller privileges).

create policy "inquiries_owner_update"
on public.inquiries for update
to authenticated
using (public.is_company_owner(company_id))
with check (public.is_company_owner(company_id));

create policy "inquiries_owner_delete"
on public.inquiries for delete
to authenticated
using (public.is_company_owner(company_id));

-- Column grants: no wildcard select; anon has no read
revoke all on table public.inquiries from public;
revoke all on table public.inquiries from anon, authenticated;

grant select (
  id, company_id, sender_name, sender_email, sender_company,
  message, service_interest, status, created_at
) on table public.inquiries to authenticated;

grant update (status) on table public.inquiries to authenticated;

grant delete on table public.inquiries to authenticated;

-- Rate-limited insert + owner notify email (anon cannot SELECT inquiries)
create or replace function public.create_inquiry(
  p_company_slug text,
  p_sender_name text,
  p_sender_email text,
  p_sender_company text default '',
  p_message text default '',
  p_service_interest text default ''
)
returns table (
  inquiry_id uuid,
  company_name text,
  company_slug text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company public.companies%rowtype;
  v_name text := trim(p_sender_name);
  v_email text := lower(trim(p_sender_email));
  v_sender_company text := coalesce(trim(p_sender_company), '');
  v_message text := trim(p_message);
  v_interest text := coalesce(trim(p_service_interest), '');
  v_id uuid;
  v_recent int;
begin
  if v_name = '' then
    raise exception 'Name is required';
  end if;

  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Valid email is required';
  end if;

  if char_length(v_message) < 10 then
    raise exception 'Message must be at least 10 characters';
  end if;

  select * into v_company
  from public.companies c
  where c.slug = trim(p_company_slug)
  limit 1;

  if v_company.id is null then
    raise exception 'Company not found';
  end if;

  if v_company.claimed is not true then
    raise exception 'Company cannot receive inquiries';
  end if;

  select count(*)::int into v_recent
  from public.inquiries i
  where i.company_id = v_company.id
    and lower(i.sender_email) = v_email
    and i.created_at > now() - interval '24 hours';

  if v_recent >= 3 then
    raise exception 'Too many inquiries. Try again tomorrow.';
  end if;

  insert into public.inquiries (
    company_id,
    sender_name,
    sender_email,
    sender_company,
    message,
    service_interest,
    status
  )
  values (
    v_company.id,
    v_name,
    v_email,
    v_sender_company,
    v_message,
    v_interest,
    'new'
  )
  returning id into v_id;

  return query
  select
    v_id,
    v_company.name,
    v_company.slug;
end;
$$;

revoke all on function public.create_inquiry(text, text, text, text, text, text) from public;
grant execute on function public.create_inquiry(text, text, text, text, text, text) to anon, authenticated;

-- Owner notify email: NEVER returned to browser-facing roles — the anon key
-- is public, so returning it from create_inquiry would let anyone harvest
-- company owners' private emails. Service role only; the server action
-- fetches it via the admin client to send the notification.
create or replace function public.get_inquiry_notify_email(p_inquiry_id uuid)
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
  from public.inquiries i
  join public.companies c on c.id = i.company_id
  left join auth.users u on u.id = c.owner_id
  where i.id = p_inquiry_id;
$$;

revoke all on function public.get_inquiry_notify_email(uuid) from public;
revoke all on function public.get_inquiry_notify_email(uuid) from anon, authenticated;
grant execute on function public.get_inquiry_notify_email(uuid) to service_role;
