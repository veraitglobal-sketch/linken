<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Hansala

A record of who works with whom, confirmed by both sides.

**The rule the whole product rests on:** a company cannot state who it worked for —
only the other side can confirm it. Everything else is machinery around that sentence.

Written in `llms.txt` as: *if it says confirmed, two companies clicked it.*

## Non-negotiable rules

Break any of these and the product stops meaning anything. They outrank convenience,
conversion, and visual preference.

- **Public shows `confirmed` only.** Never `pending`, never self-reported. A visitor sees
  one company's claim about another only after that company has confirmed it.
- **Author text is immutable.** A testimonial body, author name and role cannot be edited
  by the receiving company, by staff, or through any API. Only the author, through their
  own token. Enforced by `lock_testimonial_author_fields`.
- **Show provenance, do not gate.** Weakly-sourced records are displayed, not blocked —
  with the evidence behind them stated as plain fact. We record; we do not adjudicate.
- **Factual wording, never judgemental.** "Confirmed from a gmail.com address", never
  "unverified" or "suspicious", and no warning icons. This is a conversion decision and a
  legal one.
- **Absence is not a negative finding.** A company with no record returns `no_file` —
  never "not verified". New companies must be able to start.
- **Never publish a negative claim.** Only confirmed positive facts. No complaints, no
  failure reports, no public "disputed" state — a dispute removes the record from view
  and is resolved privately.
- **Never invent customers, quotes, numbers or logos** — not in code, not in seed data,
  not in design mockups. Where content does not exist, remove the element. A placeholder
  must never reach a visitor.
- **Strictness lives in the score, not the display.** Nobody is locked out of publishing;
  the number simply reflects what is actually behind it.

## Widgets on other people's websites

The embeds are the distribution channel. They live on customer sites, so:

- **A widget carries no brand of its own except the check mark.** No Hansala colours, no
  gradients, no our-radii. Type, colour and spacing inherit from the host or are neutral
  and configurable. The only place mint may appear is the verification mark.
- **Never print a plan tier.** No "Pro" badge on a customer's site — it tells their
  visitor the badge was paid for rather than earned.
- **The verify line and mark cannot be hidden**, including by custom CSS.
- **Embed once, configure forever.** Everything after the paste is settings, from the
  dashboard or the API. A new confirmed partner appears without anyone touching code.
- **Motion pauses off-screen and on `prefers-reduced-motion`.** It runs on someone else's
  page and must never cost them anything.
- Domain-locked via per-company CSP `frame-ancestors`; the referrer is a display and
  analytics signal only, never authorisation.

## Design language

Taken from the live product — check the running site before assuming otherwise.

- **Display type is Plus Jakarta Sans** — headlines *and* figures. There is no serif in
  headlines. Newsreader exists but is not the display face.
- Tokens live in `src/app/globals.css`. No new accent colours.
- Surfaces: `#0e1f1c` on `#f0f2f0`; hero radius 28–32px, cards 20–24px, pills 99px.
- Micro-labels: uppercase, ~11px, `tracking-[0.16em]`, muted.
- Mint `#7eb8a4` is used sparingly — the mark, a status dot, one accent per component.
- Photography: real people, real work, desaturated, architectural, unposed.

**Briefing a design change:** state what to build, not only what to avoid. Restraint
without craft produces an empty page — every section needs one visual anchor that carries
meaning, or it is not finished.

## Architecture conventions

- Sensitive state changes **only** through `security definer` RPCs granted to
  `service_role`. See `supabase/migrations/20260719270000_domain_verification.sql` for the
  pattern: RLS enabled, column-level grants, `revoke all on function … from public`.
- Data access lives in `src/features/<domain>/{queries,actions,core}.ts` — never inline in
  page components.
- Every outbound fetch of a user-supplied URL goes through
  `src/features/verification/safe-fetch.ts`.
- Domain handling: `extractDomain` / `isPublicEmailProvider` in
  `src/features/verification/domain.ts`; registrable domain via `tldts`. Verification
  matching is strict — exact host or a parent, never a subdomain of the site. The widget
  domain-lock deliberately uses the opposite rule; do not share the function.
- Bearer tokens and emails are excluded from public column grants.
- Migrations: `supabase/migrations/YYYYMMDDHHMMSS_name.sql`, never edited in place.
- `createAdminClient` (service role) must never be reachable from a client component.
- Admin staff may **hide, never rewrite**, and every admin write is audited with a
  required reason.

## Working style

- **Look at the running site before proposing UI changes.** Reading source is not enough.
- Show a plan before writing code for anything design-led: type scale, spacing scale, the
  light/dark rhythm across sections, and the two moments that carry the page.
- One section or one concern at a time; verify at 1440px and 390px.
- Prefer extending what exists to adding a parallel path — check for it first.
