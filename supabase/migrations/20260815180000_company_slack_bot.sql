-- Bot token for Block Kit + interactive buttons (Accept / Decline).
-- webhook_url stays for channel pick + fallback; bot_token is service-role only.

alter table public.company_slack
  add column if not exists bot_token text,
  add column if not exists slack_user_id text not null default '';

comment on column public.company_slack.bot_token is
  'Slack bot token (xoxb-) from OAuth — chat:write. Service-role only.';
comment on column public.company_slack.slack_user_id is
  'Slack user who connected — only they may use action buttons.';

-- bot_token / slack_user_id: no grant to authenticated (service role only)

-- Allow partnership.requested on webhook endpoint subscriptions.
alter table public.webhook_endpoints
  drop constraint if exists webhook_endpoints_events_valid;

alter table public.webhook_endpoints
  add constraint webhook_endpoints_events_valid check (
    events <> '{}'
    and events <@ array[
      'inquiry.created',
      'partnership.requested',
      'partnership.accepted',
      'reference.confirmed',
      'booking.connected'
    ]::text[]
  );
