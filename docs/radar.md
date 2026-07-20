# Linken Radar

Radar is the marketplace layer for platform-distributed project requests.
Profile inquiries remain free forever.

## Plan model (chosen)

**Add-on flag**, not a fourth `plan` value:

```sql
companies.radar boolean not null default false
```

Stacks with `free` / `pro` / `founding`. Keeps Pro widgets/analytics separate
from marketplace credits.

Entitlements (`src/features/plan/entitlements.ts`):

- `radarInstantAlerts` — digest emails for matching requests
- `radarCredits` — spend credits via `respond_to_request`

Both are true only when `companies.radar = true`.

## Brand rule

“Radar” appears **only** in:

- `/dashboard/radar`
- firm notification emails (“via Linken Radar”)

Never on public profiles, buyer manage pages, or response cards to buyers.
Buyers see Verified / trust level / assessments only.

## Admin enable (pre-Stripe)

```sql
update public.companies
set radar = true
where id = '<company_uuid>';

select public.admin_grant_credits('<company_uuid>', 15, 'admin');
```

See also `docs/admin-credits.md`.

## Company leads (discovery)

Saved searches (`saved_searches`, max 5 / firm) define targets. Matching
claimed firms land in `radar_feed_items` for the search owner.

| Event | Reason | Trigger |
|-------|--------|---------|
| New claimed company | `new_company` | after `createCompany` |
| Domain verified | `became_verified` | `markVerified` |
| Accepting clients on | `accepting_clients` | `setAcceptingClients` |
| Trust level up | `level_up` | **TODO cron** |

SQL: `match_company_to_searches` (service_role), `backfill_saved_search_feed`
(on search create, max 20), `get_radar_digest` (weekly counts).

UI: `/dashboard/radar?tab=leads` — LogoTile cards, intro / dismiss.
Matched firms are not notified; contact only via intro flow.

Weekly email: `sendRadarWeeklyDigestEmail` + `sendWeeklyRadarDigestAdmin`.
**TODO cron** — max 1 / week + unsubscribe.

## Intros (outbound InMail)

- Cost: **2 credits** via `send_intro`
- Recipient toggle: `companies.receive_intros` (defaults from `accepting_clients`)
- Quality: ≥3 `not_relevant` in 30 days → `intro_suspended_until` (+30 days)
- Inbox: `/dashboard/inbox?tab=intros` — never mixed with profile inquiries

### Reply contact (chosen)

Recipient gets a **mailto** from `get_intro_sender_reply_email` (security
definer, recipient-owner only). Safer than granting owner emails on `companies`
or website-only. No chat.

Notify: `get_intro_notify_email` (service_role) + Resend (“via Linken Radar”).
