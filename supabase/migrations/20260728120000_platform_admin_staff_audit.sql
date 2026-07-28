-- Platform staff roles + append-only admin audit log.
-- Outer gate remains PLATFORM_ADMIN_EMAILS (env). This table is the inner gate.
-- Bootstrap first owner manually:
--   insert into public.platform_staff (user_id, role, created_by)
--   values ('<auth.users.id>', 'owner', null);

create table public.platform_staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('support', 'admin', 'owner')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

alter table public.platform_staff enable row level security;

revoke all on table public.platform_staff from public;
revoke all on table public.platform_staff from anon, authenticated;
-- Service role only for mutations; app reads via service client after env gate.

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users (id) on delete restrict,
  actor_email text not null default '',
  role_at_time text not null check (role_at_time in ('support', 'admin', 'owner')),
  action text not null,
  target_type text not null default '',
  target_id text not null default '',
  reason text not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now(),
  constraint admin_audit_log_reason_nonempty check (length(trim(reason)) > 0)
);

create index admin_audit_log_created_idx
  on public.admin_audit_log (created_at desc);

create index admin_audit_log_target_idx
  on public.admin_audit_log (target_type, target_id);

create index admin_audit_log_actor_idx
  on public.admin_audit_log (actor_user_id, created_at desc);

alter table public.admin_audit_log enable row level security;

revoke all on table public.admin_audit_log from public;
revoke all on table public.admin_audit_log from anon, authenticated;

-- Append-only: block UPDATE/DELETE even for service_role via trigger.
create or replace function public.admin_audit_log_immutable()
returns trigger
language plpgsql
as $$
begin
  raise exception 'admin_audit_log is append-only';
end;
$$;

create trigger admin_audit_log_no_update
  before update on public.admin_audit_log
  for each row execute function public.admin_audit_log_immutable();

create trigger admin_audit_log_no_delete
  before delete on public.admin_audit_log
  for each row execute function public.admin_audit_log_immutable();

comment on table public.platform_staff is
  'Inner admin gate. Access = PLATFORM_ADMIN_EMAILS AND row here. Roles: support < admin < owner.';

comment on table public.admin_audit_log is
  'Append-only staff action log. Every panel write must insert a row with a non-empty reason.';
