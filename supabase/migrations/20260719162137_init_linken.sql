-- Linken core schema: companies, partnerships, projects

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  slug text not null unique,
  tagline text not null default '',
  description text not null default '',
  category text not null default '',
  city text not null default '',
  country text not null default 'Germany',
  website text not null default '',
  logo_url text,
  services text[] not null default '{}',
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_owner_unique unique (owner_id)
);

create table public.partnerships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.companies (id) on delete cascade,
  recipient_id uuid not null references public.companies (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint partnerships_not_self check (requester_id <> recipient_id),
  constraint partnerships_pair_unique unique (requester_id, recipient_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  slug text not null,
  summary text not null default '',
  location text not null default '',
  year text not null default '',
  services text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint projects_company_slug unique (company_id, slug)
);

create index companies_slug_idx on public.companies (slug);
create index partnerships_status_idx on public.partnerships (status);
create index projects_company_idx on public.projects (company_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create or replace function public.is_company_owner(company uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.companies c
    where c.id = company
      and c.owner_id = auth.uid()
  );
$$;

alter table public.companies enable row level security;
alter table public.partnerships enable row level security;
alter table public.projects enable row level security;

create policy "companies_public_read"
on public.companies for select
using (true);

create policy "companies_owner_insert"
on public.companies for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "companies_owner_update"
on public.companies for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "partnerships_public_read_accepted"
on public.partnerships for select
using (
  status = 'accepted'
  or public.is_company_owner(requester_id)
  or public.is_company_owner(recipient_id)
);

create policy "partnerships_owner_insert"
on public.partnerships for insert
to authenticated
with check (public.is_company_owner(requester_id));

create policy "partnerships_parties_update"
on public.partnerships for update
to authenticated
using (
  public.is_company_owner(requester_id)
  or public.is_company_owner(recipient_id)
)
with check (
  public.is_company_owner(requester_id)
  or public.is_company_owner(recipient_id)
);

create policy "projects_public_read"
on public.projects for select
using (true);

create policy "projects_owner_insert"
on public.projects for insert
to authenticated
with check (public.is_company_owner(company_id));

create policy "projects_owner_update"
on public.projects for update
to authenticated
using (public.is_company_owner(company_id))
with check (public.is_company_owner(company_id));

create policy "projects_owner_delete"
on public.projects for delete
to authenticated
using (public.is_company_owner(company_id));
