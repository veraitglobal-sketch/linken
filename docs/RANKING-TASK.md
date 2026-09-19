# Task: positioning — points, categories, countries, worldwide

Paste this whole file into Cursor. Read `AGENTS.md` first; its rules outrank anything here.
**Build data + queries only. No visual design** — plain, minimal markup; the design comes after.

## What we are building

A company earns points from **confirmed** records. Points decide its position in a category,
in a country, and worldwide. Two lists a visitor can reach:

- `/best/<category>` — worldwide
- `/best/<category>/<country>` — one country (and later a city filter)

This is why a company chases confirmations, and it is our search-engine surface. It only works
if the two dimensions are **clean**: one canonical category per company, one ISO country.

## Hard rules (from AGENTS.md)

- Only `confirmed` records count. Pending never appears and never scores.
- Position is **never for sale**. No plan, add-on or Enterprise contract may change it.
  Do not read `companies.plan` anywhere in the scoring path.
- A company with no records is **unranked**, never "worst" and never labelled negatively.
- Never invent a company, a category, a count or a rank — every number comes from a row.
- A disputed record is removed from view and from scoring until resolved.

## 0. The flow, screen by screen (build exactly this)

### A. `/search` — one field, two modes

Two pills above the existing search field: **Find a company** (default, today's behaviour,
nothing changes) and **Categories**. Clicking a pill switches mode; the mode lives in the URL
(`/search?mode=categories`) so it survives a reload and can be linked.

In **Categories** mode:
- Placeholder: "What kind of company? e.g. cleaning".
- As the person types, suggest canonical categories from the `categories` table
  (server action `suggestCategories(q)`): alias and name matches, each row showing the category
  name and how many companies are ranked in it ("Cleaning · 24 companies"). Never invent a
  category and never show one with zero companies.
- Enter or click on a suggestion → `router.push("/best/<category-slug>")`.
- Typed text that matches nothing: no result row, one line instead — "No category matches
  “x” yet." plus a link to search companies by name. Also insert the text into
  `category_unmatched` (dedupe, count) so we can add the alias later.

### B. `/best/<category>` — the list

- Server component. Loads the worldwide ranking for the category.
- **First screen when no place is chosen yet** (`?place` missing): the category name, the count
  of ranked companies, and the place question: a **Worldwide** button plus the countries that
  actually have companies in this category (from the data, with counts: "Germany 12",
  "Serbia 4"). One click sets `?place=worldwide` or navigates to `/best/<category>/<DE>`.
  Under it, the top 3 worldwide as a preview, so the page is never empty.
- While the next list loads, Next.js `loading.tsx` renders the waiting state
  ("Searching confirmed companies…"). Keep it plain; I will design it after.
- The list itself: position (see the ≥ 5 rule), logo, company name, city + country, the counts
  behind the points ("6 confirmed partners · 4 client references · 2 confirmed projects"),
  Verified domain when true, link to `/c/<slug>`. Pagination or "Show more" at 25 rows.
- `/best/<category>/<country>` is the same list scoped by `country_code`, with a link back to
  worldwide and the city filter as `?city=Hamburg` (exact match on the stored city text).
- `/best` lists every category that has ≥ 3 ranked companies, with counts.

### C. Registration — categories are offered, not typed blind

- `src/components/onboarding/onboarding-form.tsx`, step 3: the Sector field becomes
  `<CategoryField>` — the person types, canonical categories appear underneath, one click picks
  it. Picking sets a hidden `category_slug`.
- The person may still type something of their own: it saves as before in `category`, with
  `category_slug` null, and goes to `category_unmatched`. Show one calm line under the field:
  "Saved. We add new categories as they come up." Never block onboarding on this.
- The same field is used on `/c/[slug]/edit` (`company-settings-details.tsx`), so a company can
  correct itself later.
- Country becomes a select of ISO countries (`src/features/geo/countries.ts`), storing
  `country_code` and the display name.

### D. Linking — the category must connect everything

Everywhere a category is shown, it links to its list, and every list links back to profiles.
This is what makes the categories a system rather than a text field:

| Where | Link |
|---|---|
| Public profile `/c/<slug>` — the category chip in the hero | `/best/<category-slug>` (only when `category_slug` is set) |
| Public profile — under the chip, when the company is ranked | "#4 in Cleaning · Germany" → `/best/<category>/<country>` |
| `/search` results rows | category text links to `/best/<category-slug>` |
| `/best/<category>` rows | company name → `/c/<slug>` |
| Dashboard Home | a "Your position" card: rank worldwide and in the country, the next company's points, and what raises it |
| `sitemap` (`src/features/sitemap/build.ts`) | every `/best/<category>` and `/best/<category>/<country>` page that has ≥ 3 companies |

Ranking pages are public and indexable; the profile links keep them connected in both
directions.

## 1. Categories (the important part)

Today `companies.category` is free text: "Cleaning", "Cleaning company", "Reinigung",
"IT - Software". Ranking on that is impossible. Add a canonical taxonomy and map every company
to exactly one primary category, keeping the typed text for display.

Migration `supabase/migrations/<ts>_categories.sql`:

```sql
create table public.categories (
  slug text primary key,                    -- "cleaning", "software-development"
  name text not null,                       -- "Cleaning"
  parent_slug text references public.categories(slug),
  created_at timestamptz not null default now()
);
create table public.category_aliases (
  alias text primary key,                   -- lowercased, trimmed: "reinigung", "cleaning company"
  category_slug text not null references public.categories(slug) on delete cascade
);
alter table public.companies
  add column category_slug text references public.categories(slug),
  add column country_code text;             -- ISO 3166-1 alpha-2, uppercase
create index on public.companies (category_slug, country_code);
```

- Seed ~40 categories in the migration, English names, covering what the product targets
  (AEC, contractors, trades, agencies, IT, consulting, logistics, facility services…).
  Seed aliases for the obvious German/Serbian equivalents of the seeded ones.
- `src/features/categories/match.ts`: `matchCategory(text)` → exact alias, then normalised
  (lowercase, strip punctuation/legal suffixes like GmbH, d.o.o., Ltd), then token overlap.
  Returns `{ slug, confidence }` or null. Pure and unit-testable.
- Backfill in the migration where confidence is exact/alias; leave the rest null.
**Exactly which files change:**

| File | Change |
|---|---|
| `src/components/onboarding/onboarding-form.tsx` (step 3, `name="category"`, line ~235) | Replace the free `<input>` with a new `<CategoryField>` (below). Keeps posting `category`, adds hidden `category_slug`. |
| `src/components/company/company-settings-details.tsx` (`name="category"` and `name="country"`) | Same `<CategoryField>`; country field becomes a `<select>` of ISO countries posting `country_code` plus the display name in `country`. |
| `src/components/categories/category-field.tsx` (new, client) | Text input + suggestion list read from `categories`; on pick sets hidden `category_slug`; free typing allowed with `category_slug` empty. |
| `src/features/company/actions.ts` (`createCompany`, `startOnboarding`) and `src/features/company/profile-actions.ts` (`updateCompanyProfile`) | Read `category_slug`/`country_code` from the form, re-run `matchCategory()` server-side as the authority (never trust the hidden field), write both columns, and insert into `category_unmatched` when nothing matches. |
| `src/features/company/agent-patch.ts` | Same normalisation for Agent API writes, so `hansala_update_company` cannot bypass it. |
| `src/features/companies/queries.ts` (`searchCompanies`) | Keep as is. Add an optional `categorySlug` filter — do not change the existing text search behaviour. |

Country: normalise on save to ISO alpha-2 (`country_code`) from the country text; keep
`country` and `city` as the display strings. One lookup list in
`src/features/geo/countries.ts`, used by both the form and the server action.

## 2. Scoring

Extend, do not replace, `src/features/trust/score.ts` (`computeTrustScore` stays as is for the
profile). Add `src/features/ranking/score.ts`:

```
rankPoints = Σ over confirmed records of  base(record) × verifiedWeight × recency × counterpartyCap
```

- base: confirmed partner 2, confirmed reference 2, ongoing reference 3,
  client-confirmed case study 3, partner-confirmed case study 2,
  testimonial attached to a confirmed record 1 (standalone 0.25, free-mail author 0).
- verifiedWeight: 1.0 when the **counterparty** has a verified domain, else 0.4.
- recency: 1.0 for ≤ 12 months, 0.7 for ≤ 24, 0.45 for ≤ 36, 0.25 beyond.
  Confirmation date, not creation date.
- counterpartyCap: points from one counterparty company are capped at 6 in total, so a pair
  confirming each other in a loop cannot climb.
- Distinct counterparties are also stored (`distinct_partners`) — needed for the display rule below.

Pure functions, no DB access, with unit tests for: cap, decay boundaries, unverified weighting,
free-mail testimonial = 0.

## 3. Ranking table + refresh

```sql
create table public.company_rank (
  company_id uuid primary key references public.companies(id) on delete cascade,
  category_slug text references public.categories(slug),
  country_code text,
  points numeric not null default 0,
  distinct_partners int not null default 0,
  confirmed_records int not null default 0,
  last_confirmed_at timestamptz,
  computed_at timestamptz not null default now()
);
create index on public.company_rank (category_slug, points desc);
create index on public.company_rank (category_slug, country_code, points desc);
```

- `security definer` RPC `recompute_company_rank(p_company_id uuid)` — recomputes one company
  from confirmed rows only; granted to `service_role`.
- **Call it from exactly these places** (after the write succeeds, never blocking the response —
  fire and log failures):

| Event | File / function |
|---|---|
| Partnership accepted or declined | `src/features/network/partnership-respond.ts` → `respondPartnership` |
| Partnership dissolved | `src/features/network/graph-actions.ts` → `disconnectGraphEdge` |
| Confirmed on claim | `src/features/partners/confirm-on-claim.ts` → `confirmPartnershipsAfterClaim` |
| Client reference confirmed / declined | `src/features/references/confirm-actions.ts` → `confirmServiceReference`, `declineServiceReference` |
| Case study client confirmation | `src/features/case-studies/actions.ts` → `confirmClientRequest`, `declineClientRequest` |
| Case study partner role confirmed | `src/features/case-studies/actions.ts` → `confirmCaseStudyPartnerRole` |
| Testimonial published | `src/features/testimonials/post-confirm.ts` → `ensureTestimonialAfterConfirm` |
| Dispute opened / resolved | wherever the dispute status is written (`src/features/admin/…`) |
| Category or country changed | `src/features/company/profile-actions.ts` → `updateCompanyProfile`, `src/features/company/agent-patch.ts` |

  Put the call behind one helper, `src/features/ranking/refresh.ts` → `refreshRank(companyId[])`,
  so there is a single place to change. **Both sides** of a confirmed record are recomputed.
- A daily job (`/api/cron/rank-refresh`, protected by a secret header) recomputes everything so
  decay moves without any new event. Log how many rows changed.
- Ranks are computed at read time from `points desc` with `company_id` as the tiebreaker — do not
  store a rank number that goes stale.

## 4. Queries (`src/features/ranking/queries.ts`)

- `getRanking({ categorySlug, countryCode?, limit, cursor })` → rows with company display fields,
  points, distinct_partners, confirmed_records, verified, city, country.
- `getCompanyPositions(companyId)` → its position in category-worldwide and category-country,
  plus how many companies are in each list.
- `listRankedCategories()` → categories that have at least 3 ranked companies (for the index
  page and for the search suggestions).
- Public read: no auth, safe columns only, no emails, no pending anything.

**Display rule:** show a numbered position only when the list has **≥ 5 ranked companies**;
below that render the same rows without numbers. A "#1 worldwide" out of two companies is a lie
we do not need.

## 5. Minimal routes (no design)

- `/best` — list of categories that have rankings.
- `/best/[category]` — worldwide list, `?country=DE` filter supported.
- `/best/[category]/[country]` — same list scoped to a country.
- Each row: company name, city + country, points, and the counts behind the points
  ("6 confirmed partners · 4 client references · 2 confirmed projects"), link to `/c/<slug>`.
- Plain HTML, our existing components where they fit. No new visual language — I will design it.
- Metadata: title/description from real counts ("12 confirmed cleaning companies in Germany").
  `notFound()` for unknown category or country.

## 6. Search page hook

Implement flow **A** in `src/components/search/directory-search.tsx`: the two pills, the URL
mode, and the category suggestions (`suggestCategories`). The company mode keeps using
`searchCompaniesForGraph` exactly as today.
Do **not** touch `src/components/marketing/home-hero-search.tsx` — the homepage typeahead stays
as it is for now.

## 7. What this replaces, and what it must not touch

- **Replaces:** nothing is deleted. `companies.category` stays and is still displayed; the new
  `category_slug` is an added, normalised dimension next to it.
- `computeTrustScore` in `src/features/trust/score.ts` stays exactly as it is — it drives the
  profile's trust level. Ranking gets its own scorer; do not change the profile numbers.
- Do not change `src/features/widgets/*`, the embeds, or anything under `src/app/embed`.
- Do not change the MCP or OAuth files (`src/app/api/mcp/*`, `src/features/mcp/*`,
  `src/features/oauth/*`, `src/app/api/oauth/*`) — another task owns them.
- Do not edit `supabase/migrations/20260916003000_mcp_oauth.sql` or any existing migration.


## 8. Plans, quotas and what lapses (second phase, same task)

The money rule: **we charge for starting records and for our surfaces, never for showing a
confirmed record.** A confirmed record is public forever, and an incoming confirmation is never
refused, whatever the other company's plan is.

### 8.1 Metering

New table:

```sql
create table public.invite_usage (
  company_id uuid not null references public.companies(id) on delete cascade,
  period date not null,                       -- first day of the billing month, UTC
  invites_sent int not null default 0,
  primary key (company_id, period)
);
```

`security definer` RPC `consume_invite(p_company_id uuid, p_limit int)` — increments and returns
the new count, or fails when the limit is reached. One call per outbound invite, inside the
existing action, **before** the email is sent:

| Outbound invite | File / function |
|---|---|
| Partner invite (existing company) | `src/features/network/partnership-request.ts` |
| Partner invite by email / unclaimed | `src/features/partners/core.ts` → `createUnclaimedPartnerCore` |
| Client reference invite | `src/features/references/*` invite action |
| Case study client confirmation request | `src/features/case-studies/actions.ts` → `requestClientConfirmation` |
| Testimonial invite | `src/features/testimonials/*` invite action |
| Reminder to a pending invite | `src/features/partners/resend-pending-invite.ts` |
| Agent API equivalents | `src/app/api/v1/agent/partner-invites`, `/references/[id]/invite`, `/client-confirmations` |

Limits come from entitlements, not from scattered constants:
`src/features/plan/entitlements.ts` gains `monthlyInvites` — Free 10, Pro 70 — plus
`extraInvitePacks` (each pack = +10) read from the company's billing row. The existing daily
anti-spam caps in `src/features/growth/invite-limits.ts` stay on top of this, unchanged.

Team invites (`invite_team_member`) are **not** metered — they are seats, not records.

### 8.2 What the person sees

- Dashboard Home and every invite form show "7 of 10 invites left this month". At zero:
  "You have used this month's invites" plus a link to Billing. Never a silent failure.
- Billing page: current usage, the pack add-on (+10 for €10 / month), and one line of plain
  English: *"You can buy more space to show your work. You cannot buy trust — confirmations,
  positions and the mark are never for sale."*
- Stripe: the pack is a recurring add-on subscription item, not a one-off purchase. Wire it the
  same way the Pro subscription is wired in `src/features/billing/*`; tell me which price IDs to
  create in Stripe, do not invent them.

### 8.3 What lapses when Pro ends

Records, profile, category, position and the mark stay. These stop:
contact button and inquiry form on the public profile, inbox delivery of inquiries, Radar
intros, the booking link button, widgets on other sites (`/embed/*` returns the free variants
only), analytics beyond the basics, outbound webhooks, team seats above one, invites drop to the
free monthly number. Put this in one place — `src/features/plan/access.ts` — as a single
`lapsedCapabilities()` used by every call site, so it can never drift.

## 9. Enterprise: supplier check (third phase, design first — do not build yet)

A buyer (procurement, marketplace, chamber) checks companies instead of proving itself. Write
the API design only, as `docs/SUPPLIER-CHECK.md`: bulk verify of a list of domains, a webhook
when a supplier's confirmed record changes, an export, and rate limits per contract. No UI, no
migration yet — I want to read the shape before anything is built.

## 10. Order of work

1. Categories + countries (section 1) with the backfill report — nothing else works without it.
2. Scoring + `company_rank` + refresh hooks (2, 3) and the queries (4).
3. Flow A, B, C, D (section 0) with plain markup (5, 6).
4. Quotas and lapsing (8).
5. Only then the supplier-check design (9).

Stop and show me the numbers after step 1 (how many companies matched a category, the unmatched
list) before continuing — a wrong taxonomy poisons every number after it.

## Verify before handing back

1. `npx tsc --noEmit`, `npx eslint`, `npm run build`, unit tests for scoring and matching.
2. Seed check: `select count(*) from companies where category_slug is null` — report the number
   and the top 10 unmatched texts, do not force a match.
3. `/best/cleaning` and `/best/cleaning/DE` render from real rows; a category with fewer than 5
   companies shows no position numbers.
4. Confirm a test partnership locally → the ranking changes after the RPC runs.
5. Report: how many companies are ranked, how many categories have ≥ 5, and the largest list.
6. Quotas: sending an invite increments usage; at the limit the action fails with the message,
   not a crash; an **incoming** confirmation still works for a company at its limit.
7. Lapsing: with `plan = "free"` the profile still shows records, category and position, and the
   contact button, widgets and API are gone.

Tell me to run `supabase db push` — do not run it yourself, and never edit an existing migration.
