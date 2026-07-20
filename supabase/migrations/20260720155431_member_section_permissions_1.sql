-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260720155431
-- name: member_section_permissions_1
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

-- Part B: granular section permissions for company_members role = member.

create or replace function public.is_valid_workspace_section(p_section text)
returns boolean
language sql
immutable
as $$
  select lower(trim(p_section)) in (
    'network',
    'structure',
    'partners',
    'team',
    'verification',
    'widgets',
    'api',
    'insights',
    'inbox',
    'radar',
    'settings'
  );
$$;

create or replace function public.normalize_section_permissions(p_permissions text[])
returns text[]
language plpgsql
immutable
as $$
declare
  v_out text[] := '{}';
  v_item text;
  v_norm text;
begin
  if p_permissions is null then
    return '{}';
  end if;
  foreach v_item in array p_permissions loop
    v_norm := lower(trim(v_item));
    if public.is_valid_workspace_section(v_norm)
       and not (v_norm = any (v_out))
    then
      v_out := array_append(v_out, v_norm);
    end if;
  end loop;
  return v_out;
end;
$$;

alter table public.company_members
  add column if not exists permissions text[] not null default '{}';

alter table public.company_members
  drop constraint if exists company_members_permissions_valid;

alter table public.company_members
  add constraint company_members_permissions_valid
  check (
    permissions <@ array[
      'network',
      'structure',
      'partners',
      'team',
      'verification',
      'widgets',
      'api',
      'insights',
      'inbox',
      'radar',
      'settings'
    ]::text[]
  );

comment on column public.company_members.permissions is
  'Section keys for role=member only. Ignored for owner/admin (full access).';

alter table public.team_invitations
  add column if not exists permissions text[] not null default '{}';

alter table public.team_invitations
  drop constraint if exists team_invitations_permissions_valid;

alter table public.team_invitations
  add constraint team_invitations_permissions_valid
  check (
    permissions <@ array[
      'network',
      'structure',
      'partners',
      'team',
      'verification',
      'widgets',
      'api',
      'insights',
      'inbox',
      'radar',
      'settings'
    ]::text[]
  );

-- Expose permissions on select grants.
grant select (
  id,
  company_id,
  invited_by,
  invite_name,
  invite_title,
  invite_email,
  role,
  permissions,
  status,
  created_at,
  resolved_at
) on public.team_invitations to authenticated;

grant select on public.company_members to authenticated;
