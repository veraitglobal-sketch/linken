# Product analytics

Privacy-conscious, provider-agnostic product analytics for Hansala.

## North-star metric

**Seven-day activation rate:** percentage of new claimed companies that emit
`first_reference_confirmed` within **7 days** of `companies.created_at`.

“Verified reference” here means a **mutually confirmed** service reference
(not domain verification alone).

## Architecture

```
UI / actions / webhooks
        │
        ▼
 track() / trackServer()   ← only public API
        │
        ├─ sanitize props (no emails / tokens / names)
        ├─ consent gate (visitor beacons)
        ├─ once-per-company dedupe
        ▼
 AnalyticsProvider[]
        │
        └─ first_party → product_events (Supabase)
           (+ optional console when PRODUCT_ANALYTICS_CONSOLE=1)
```

Do **not** call vendor SDKs from components. Add a new `AnalyticsProvider`
implementation and register it in `providers/resolve.ts` if you connect a
vendor later — and gate it with vendor consent.

## Consent

| Cookie | Values | Default |
|--------|--------|---------|
| `hansala_analytics` | `1` allow / `0` deny | allow (legitimate interest) |
| `hansala_analytics_vendors` | `1` allow / `0` deny | deny |

- Visitor events (`landing_page_viewed`, `pricing_viewed`, `profile_viewed`, …)
  honor the first-party opt-out.
- Company lifecycle / Stripe webhooks use `trackServer` (contract + LI).
- Preferences UI: `/cookies`.

## Event taxonomy

### Acquisition
| Event | When | Props |
|-------|------|-------|
| `landing_page_viewed` | Home beacon | `page`, `surface` |
| `signup_started` | Login “create” mode | `page`, `surface` |
| `signup_completed` | Auth signup success | `surface` |

### Activation
| Event | When | Once/company |
|-------|------|--------------|
| `company_created` | Company created | yes |
| `domain_verified` | Domain verification succeeds | yes |
| `first_project_created` | First reference/case project | yes |
| `first_invitation_sent` | First invite email sent | yes |
| `first_invitation_opened` | Confirm-reference page open (pending) | yes |
| `first_reference_confirmed` | Client confirms reference | yes |
| `first_reference_published` | Proof shared / published path | yes |

### Engagement
| Event | When |
|-------|------|
| `project_created` | Each new reference project |
| `invitation_sent` | Each invite send |
| `reminder_sent` | Reminder email (wire when added) |
| `profile_viewed` | Public profile visit (consent-gated) |
| `embed_created` | Operator copies embed snippet |
| `embed_installed` | Host placement recorded |
| `proposal_export_created` | Owner opens one-pager |

### Revenue
| Event | When |
|-------|------|
| `pricing_viewed` | `/pricing` beacon |
| `checkout_started` | Stripe Checkout session created |
| `subscription_started` | Checkout completed → Pro |
| `subscription_upgraded` / `_downgraded` | Plan change |
| `subscription_cancelled` | Subscription deleted |
| `payment_failed` | `invoice.payment_failed` |

### Growth
| Event | When |
|-------|------|
| `invited_company_confirmed` | Invitee confirms a reference |
| `invited_company_created_profile` | Claim completes |
| `invited_company_sent_first_invitation` | Claimed invitee sends first invite |

### Internal (allowed)
`domain_verification_started`, `first_invitation_started`, `dashboard_cta_clicked`

## Forbidden properties

Never send: `email`, `invite_email`, `name`, `client_name`, `token`,
`claim_token`, `password`, `body`, `quote`, or any string matching an email.

Allowlist: `page`, `source`, `plan`, `previous_plan`, `cta`, `surface`,
`variant`, `host_bucket`, `invite_kind`, `days_since_company_created`, `is_first`.

## Setup

1. Apply migration `supabase/migrations/20260806210000_product_events.sql`.
2. No vendor required — first-party sink works with service role.
3. Optional: `PRODUCT_ANALYTICS_CONSOLE=1` for local event logs.
4. Optional vendor: implement `AnalyticsProvider` with
   `requiresVendorConsent: true`, register in `resolve.ts`.

## Reports

Specs: `src/features/product-analytics/reports.ts`  
SQL: `docs/sql/product-analytics-reports.sql`

Primary dashboard tile: **seven_day_activation_rate**.

## Related first-party tables

| Table | Role |
|-------|------|
| `product_events` | Canonical product funnel |
| `profile_events` | Public profile/embed counters (owner Insights) |
| `widget_placements` | Embed host telemetry |
| `activation_events` | Legacy — bridged through `logActivationEvent` → `trackServer` |

Prefer `import { track, trackServer } from "@/features/product-analytics"`.
