-- Per-company Slack connection (Incoming Webhook via OAuth).
-- webhook_url is service-role only — never granted to authenticated.

create table public.company_slack (
  company_id uuid primary key references public.companies (id) on delete cascade,
  team_id text not null,
  team_name text not null default '',
  channel_id text not null default '',
  channel_name text not null default '',
  webhook_url text not null,
  connected_by uuid references auth.users (id) on delete set null,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint company_slack_webhook_https check (webhook_url ~* '^https://hooks\.slack\.com/')
);

comment on table public.company_slack is
  'Slack Incoming Webhook from OAuth — posts confirmations/inquiries to the customer workspace.';

alter table public.company_slack enable row level security;

create policy "company_slack_owner_select"
on public.company_slack for select
to authenticated
using (public.is_company_owner(company_id));

revoke all on table public.company_slack from public, anon, authenticated;
grant select (
  company_id, team_id, team_name, channel_id, channel_name,
  connected_by, connected_at, updated_at
) on public.company_slack to authenticated;
-- webhook_url: no grant to authenticated; service role only
