# Testing & QA — Hansala

This is the developer guide for local and CI quality checks. It does not claim
certification or coverage percentages as compliance.

## Principles

- Prefer **fast, deterministic** unit tests (Node’s built-in test runner).
- Use **synthetic fixtures** only (`tests/fixtures/synthetic.mjs`) — never real PII.
- Playwright covers **public smoke + a11y**; full DB journeys need secrets or the manual script.
- Avoid flaky waits: `domcontentloaded`, role/label selectors, one retry in CI.
- Clear failures: assert messages name the invariant; Playwright uses list + GitHub reporters.

## Test pyramid

| Layer | How | Speed |
|-------|-----|-------|
| Unit | `npm run test:unit` — domain, plan, growth, security mirrors | ~1s |
| Component / UI smoke | Playwright public routes + form labels + axe | ~1–2 min |
| Integration / journeys | `tests/journeys`, authz, API contract (pure rules) | <1s |
| Authz | `npm run test:authz` + security suite | <1s |
| Accessibility | Static checks in unit + `npm run test:a11y` | CI |
| Email | `npm run test:email` — escape + synthetic names | <1s |
| API contract | `npm run test:api-contract` | <1s |
| Migrations | `npm run test:migrations` | <1s |
| E2E (DB) | `scripts/e2e-confirm-verify.mjs` (manual / optional CI) | slow |
| Post-deploy smoke | `npm run smoke:deploy` against live `BASE_URL` | ~5s |

There is no separate React Testing Library suite yet: keep pure logic in Node tests
and UI assertions in Playwright to avoid a second framework and keep CI fast.

## Layout

| Path | Role |
|------|------|
| `scripts/test-*.mjs` | Legacy + domain unit suites (pure mirrors) |
| `tests/fixtures/` | Synthetic companies, tokens, emails |
| `tests/journeys/` | Invite → confirm → public/private rules |
| `tests/email/` | Template escaping + copy |
| `tests/api/` | Public API contract |
| `tests/authz/` | Tenant isolation helpers |
| `tests/migrations/` | Migration filename / safety checks |
| `e2e/smoke.spec.ts` | Public route + form smoke |
| `e2e/a11y.spec.ts` | axe WCAG checks |
| `e2e/journeys.spec.ts` | Optional authenticated sign-in |
| `scripts/e2e-confirm-verify.mjs` | Full DB E2E (manual / nightly) |
| `scripts/post-deploy-smoke.mjs` | Live URL smoke after deploy |

## Critical journeys

| Journey | Automated where |
|---------|-----------------|
| Account / company create | Manual + `e2e-confirm-verify` / auth smoke when secrets set |
| Domain verify | `scripts/e2e-confirm-verify.mjs` |
| Project create / invite send | Rules in journeys + DB script |
| Recipient opens invite / requests change / confirms | Journeys + `e2e-confirm-verify` |
| Pending private / confirmed public | `tests/journeys` + security/RLS migrations |
| Embed create | Manual / agent smoke + widget unit where present |
| Upgrade / cancel Pro | `tests/journeys` billing entitlements + plan unit tests |
| Account deletion | Public `/data-deletion` smoke (process is email request today) |

## Local commands

```bash
# Install
npm ci
npx playwright install chromium

# Fast loop (format subset, lint, types, all unit suites)
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run test:migrations

# Full pre-push parity with CI (includes production build)
npm run test:ci

# After build: Playwright smoke + a11y
npm run build
npm run test:e2e

# Individual suites
npm run test:email
npm run test:api-contract
npm run test:authz
npm run test:journeys
npm run test:security
npm run test:a11y

# Live deploy smoke
BASE_URL=https://your-deploy.example npm run smoke:deploy

# Full DB confirmation + domain E2E (needs .env.local + local app)
node scripts/e2e-confirm-verify.mjs
```

CI quality job equivalent:

```bash
npm run test:ci && npx playwright install chromium && npm run test:e2e
```

(`test:ci` already runs the production build.)

### Authenticated Playwright

```bash
E2E_USER_EMAIL=qa+northline@example.test \
E2E_USER_PASSWORD='…' \
npm run test:smoke
```

## CI pipeline

1. Format check (tests + e2e)  
2. Lint (`src` + `e2e` only; `mcp/`, `node_modules/`, SQL ignored)  
3. Typecheck  
4. Unit / journey / email / API / authz / a11y-static / security  
5. Migration validation  
6. Production build  
7. Playwright smoke + a11y  

Optional jobs (repo variables/secrets):

- `RUN_E2E_AUTH=true` + `E2E_USER_*` secrets → authenticated smoke  
- `SMOKE_BASE_URL` on `main` → post-deploy HTTP smoke  

Lint notes: OAuth/API redirect anchors keep `<a>` (rule off for those files).
`react-hooks/set-state-in-effect` is warn-level so intentional reset-on-prop
patterns do not block merges.

## Flake prevention

- No `waitForTimeout`; use URL / locator assertions with bounded timeouts.
- Public smoke does not depend on Supabase data.
- Unit tests never hit the network (`test-resend` is opt-in only).
- CI retries Playwright once; traces on first retry.
- Auth journeys skip cleanly when `E2E_USER_*` are unset (no false failures).

## Adding tests

1. Pure logic → `tests/**/*.test.mjs` or `scripts/test-*.mjs`, use fixtures.  
2. HTTP contract → extend `tests/api/contract.test.mjs`.  
3. Public UI → `e2e/smoke.spec.ts`.  
4. DB mutation flows → extend `scripts/e2e-confirm-verify.mjs` (cleanup `@e2elaunch.com` / `e2e-*` only).
