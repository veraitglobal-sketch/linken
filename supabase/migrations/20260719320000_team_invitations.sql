-- Team invitations + public visibility consent (GDPR: person opts in, not employer)

-- ─── company_members: display + consent columns ───────────────────────────

alter table public.company_members
  add column if not exists display_name text not null default '',
  add column if not exists display_title text not null default '',
  add column if not exists photo_url text,
  add column if not exists public_visible boolean not null default false;

comment on column public.company_members.public_visible is
  'Person opted to appear on public company profile. Default false — employer cannot force.';

-- Membership rows are created via respond_team_invitation / owner trigger only
drop policy if exists "company_members_owner_insert" on public.company_members;
revoke insert on public.company_members from authenticated;

drop policy if exists "company_members_owner_delete" on public.company_members;

create policy "company_members_delete"
on public.company_members for delete
to authenticated
using (
  role <> 'owner'
  and (
    user_id = auth.uid()
    or public.is_company_owner(company_id)
  )
);

create policy "company_members_self_update"
on public.company_members for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

revoke update on public.company_members from authenticated;
grant update (
  display_name,
  display_title,
  photo_url,
  public_visible
) on public.company_members to authenticated;

-- Keep select + delete
grant select, delete on public.company_members to authenticated;

-- ─── team_invitations ─────────────────────────────────────────────────────

create table public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  invited_by uuid not null references auth.users (id) on delete cascade,
  invite_name text not null,
  invite_title text not null default '',
  invite_email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index team_invitations_company_status_idx
  on public.team_invitations (company_id, status);

create index team_invitations_email_idx
  on public.team_invitations (lower(invite_email));

alter table public.team_invitations enable row level security;

create policy "team_invitations_admin_select"
on public.team_invitations for select
to authenticated
using (public.is_company_member(company_id, 'admin'));

-- No direct INSERT: create_team_invitation (security definer) is the only
-- write path — it enforces the 20-pending cap and duplicate checks, which a
-- direct insert would bypass.

create policy "team_invitations_admin_cancel"
on public.team_invitations for update
to authenticated
using (
  public.is_company_member(company_id, 'admin')
  and status = 'pending'
)
with check (
  public.is_company_member(company_id, 'admin')
  and status = 'cancelled'
);

revoke all on public.team_invitations from anon, authenticated;
grant select (
  id,
  company_id,
  invited_by,
  invite_name,
  invite_title,
  invite_email,
  role,
  status,
  created_at,
  resolved_at
) on public.team_invitations to authenticated;
grant update (status, resolved_at) on public.team_invitations to authenticated;

-- ─── RPC: create_team_invitation (returns token once) ─────────────────────

create or replace function public.create_team_invitation(
  p_company_id uuid,
  p_invite_name text,
  p_invite_title text,
  p_invite_email text,
  p_role text default 'member'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending int;
  v_token uuid;
  v_email text := lower(trim(p_invite_email));
  v_name text := trim(p_invite_name);
  v_title text := coalesce(trim(p_invite_title), '');
  v_role text := lower(trim(coalesce(p_role, 'member')));
  v_existing_user uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_company_member(p_company_id, 'admin') then
    raise exception 'Only owner or admin can invite';
  end if;
  if v_name = '' or v_email = '' then
    raise exception 'Name and email are required';
  end if;
  if v_role not in ('admin', 'member') then
    raise exception 'Role must be admin or member';
  end if;

  select count(*)::int into v_pending
  from public.team_invitations
  where company_id = p_company_id
    and status = 'pending';

  if v_pending >= 20 then
    raise exception 'Max 20 pending invites per company';
  end if;

  v_existing_user := public.lookup_user_id_by_email(v_email);
  if v_existing_user is not null and exists (
    select 1
    from public.company_members m
    where m.company_id = p_company_id
      and m.user_id = v_existing_user
  ) then
    raise exception 'Already a member';
  end if;

  if exists (
    select 1
    from public.team_invitations
    where company_id = p_company_id
      and lower(invite_email) = v_email
      and status = 'pending'
  ) then
    raise exception 'Invite already pending for this email';
  end if;

  insert into public.team_invitations (
    company_id,
    invited_by,
    invite_name,
    invite_title,
    invite_email,
    role
  )
  values (
    p_company_id,
    auth.uid(),
    v_name,
    v_title,
    v_email,
    v_role
  )
  returning token into v_token;

  return v_token;
end;
$$;

revoke all on function public.create_team_invitation(uuid, text, text, text, text) from public;
grant execute on function public.create_team_invitation(uuid, text, text, text, text) to authenticated;

-- ─── RPC: get_team_invite_preview ─────────────────────────────────────────

create or replace function public.get_team_invite_preview(p_token uuid)
returns table (
  invitation_id uuid,
  company_id uuid,
  company_name text,
  company_slug text,
  invite_name text,
  invite_title text,
  invite_email text,
  role text,
  status text,
  inviter_hint text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.id,
    c.id,
    c.name,
    c.slug,
    i.invite_name,
    i.invite_title,
    i.invite_email,
    i.role,
    i.status,
    coalesce(
      (
        select nullif(trim(m.display_name), '')
        from public.company_members m
        where m.company_id = i.company_id
          and m.user_id = i.invited_by
        limit 1
      ),
      'A teammate'
    ) as inviter_hint
  from public.team_invitations i
  join public.companies c on c.id = i.company_id
  where i.token = p_token;
$$;

revoke all on function public.get_team_invite_preview(uuid) from public;
grant execute on function public.get_team_invite_preview(uuid) to anon, authenticated;

-- ─── RPC: respond_team_invitation ─────────────────────────────────────────

create or replace function public.respond_team_invitation(
  p_token uuid,
  p_decision text,
  p_public_visible boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv public.team_invitations%rowtype;
  v_decision text := lower(trim(p_decision));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if v_decision not in ('accepted', 'declined') then
    raise exception 'Invalid decision';
  end if;

  select * into v_inv
  from public.team_invitations
  where token = p_token
  for update;

  if not found then
    raise exception 'Invite not found';
  end if;
  if v_inv.status <> 'pending' then
    raise exception 'Invite already closed';
  end if;

  if v_decision = 'declined' then
    update public.team_invitations
    set status = 'declined',
        resolved_at = now()
    where id = v_inv.id;
    return;
  end if;

  if exists (
    select 1
    from public.company_members
    where company_id = v_inv.company_id
      and user_id = auth.uid()
  ) then
    raise exception 'Already a member';
  end if;

  insert into public.company_members (
    company_id,
    user_id,
    role,
    display_name,
    display_title,
    public_visible
  )
  values (
    v_inv.company_id,
    auth.uid(),
    v_inv.role,
    v_inv.invite_name,
    v_inv.invite_title,
    coalesce(p_public_visible, false)
  );

  update public.team_invitations
  set status = 'accepted',
      resolved_at = now()
  where id = v_inv.id;
end;
$$;

revoke all on function public.respond_team_invitation(uuid, text, boolean) from public;
grant execute on function public.respond_team_invitation(uuid, text, boolean) to authenticated;

-- ─── RPC: get_public_team (no user_id) ────────────────────────────────────

create or replace function public.get_public_team(p_company_id uuid)
returns table (
  display_name text,
  display_title text,
  photo_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.display_name,
    m.display_title,
    m.photo_url
  from public.company_members m
  where m.company_id = p_company_id
    and m.public_visible = true
    and nullif(trim(m.display_name), '') is not null
  order by
    case m.role when 'owner' then 0 when 'admin' then 1 else 2 end,
    m.created_at asc;
$$;

revoke all on function public.get_public_team(uuid) from public;
grant execute on function public.get_public_team(uuid) to anon, authenticated;

-- ─── Storage: team-photos ─────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('team-photos', 'team-photos', true)
on conflict (id) do nothing;

drop policy if exists "team_photos_public_read" on storage.objects;
create policy "team_photos_public_read"
on storage.objects for select
using (bucket_id = 'team-photos');

drop policy if exists "team_photos_owner_upload" on storage.objects;
create policy "team_photos_owner_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'team-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "team_photos_owner_update" on storage.objects;
create policy "team_photos_owner_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'team-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'team-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "team_photos_owner_delete" on storage.objects;
create policy "team_photos_owner_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'team-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
