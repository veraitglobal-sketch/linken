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
