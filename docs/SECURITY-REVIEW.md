# Security & privacy review (Aug 2026)

This document does **not** claim SOC 2, ISO 27001, GDPR certification, or any audit attestation.

## Prioritized remediation

### P0 (fixed in this pass)

1. **Claim-token disclosure via add-workspace lookup** — tokens no longer returned to the browser; domain oracle removed; claim resolves token server-side only when session email matches `invite_email`.
2. **Outbound webhook SSRF** — HTTPS-only, private/metadata hosts blocked at validate + pre-delivery DNS check; redirects disabled on delivery.

### P1 (fixed in this pass)

3. Reference invite emails now share the daily invite quota.
4. Dashboard CTA / dismiss analytics use the operator’s active company (ignore client `companyId`).
5. RLS: pending service references and unconfirmed case-study partners are no longer publicly selectable.
6. `claim_company` / `accept_ownership_transfer` bind to invite email.
7. Confirm preview omits `invite_email` after resolution.
8. Claim-invite resend rate-limited; public API + analytics beacon soft IP limits.
9. Baseline security headers + CSP report-only; Agent API CORS `*` removed.
10. Dev email logs mask token URLs.

### P2 (remaining)

- Durable (DB/Redis) rate limits across instances for auth, confirm, claim, public API.
- DNS-rebinding hardening for `safe-fetch` (connect-by-resolved-IP).
- Confirm-token expiry / rotation after resolve (token currently retained for post-confirm UX).
- Enforcing CSP (move from report-only after allowlist stabilizes).
- HSTS at the edge (Vercel / DNS).
- Seeded e2e auth tests for dashboard tenant isolation.

## Manual actions required

1. Apply migration `supabase/migrations/20260807140000_security_tenant_hardening.sql`.
2. Rotate any claim tokens that may have been exposed via add-workspace before this fix (optional: `update companies set claim_token = gen_random_uuid() where claimed = false`).
3. Review existing webhook endpoint URLs for private hosts; deactivate any that fail the new validator.
4. Confirm `SUPABASE_SERVICE_ROLE_KEY` is never in client bundles / public env.
5. Set production `NEXT_PUBLIC_SITE_URL`, Stripe webhook secrets, and Resend keys in the host environment only.

## Recommended external testing

- Penetration test focused on claim/transfer/confirm token handling and tenant IDOR.
- Authenticated multi-tenant abuse cases (operator A vs company B).
- Webhook SSRF regression with cloud metadata URLs.
- Public API abuse / rate-limit bypass across multiple IPs.
- Review Supabase RLS with `anon` key against pending tables after migration.

## Tests

```bash
npm run test:security
```
