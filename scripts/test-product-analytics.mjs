import assert from "node:assert/strict";
import test from "node:test";

/**
 * Mirror of product-analytics privacy / taxonomy helpers.
 * npm run test:analytics
 */

const PRODUCT_EVENTS = [
  "landing_page_viewed",
  "signup_started",
  "signup_completed",
  "company_created",
  "domain_verified",
  "first_project_created",
  "first_invitation_sent",
  "first_invitation_opened",
  "first_reference_confirmed",
  "first_reference_published",
  "project_created",
  "invitation_sent",
  "reminder_sent",
  "profile_viewed",
  "embed_created",
  "embed_installed",
  "proposal_export_created",
  "pricing_viewed",
  "checkout_started",
  "subscription_started",
  "subscription_upgraded",
  "subscription_downgraded",
  "subscription_cancelled",
  "payment_failed",
  "invited_company_confirmed",
  "invited_company_created_profile",
  "invited_company_sent_first_invitation",
  "domain_verification_started",
  "first_invitation_started",
  "dashboard_cta_clicked",
];

const ONCE = new Set([
  "company_created",
  "domain_verified",
  "first_project_created",
  "first_invitation_sent",
  "first_invitation_opened",
  "first_reference_confirmed",
  "first_reference_published",
  "invited_company_confirmed",
  "invited_company_created_profile",
  "invited_company_sent_first_invitation",
  "subscription_started",
]);

const FORBIDDEN = [
  "email",
  "invite_email",
  "author_email",
  "name",
  "client_name",
  "token",
  "claim_token",
  "password",
  "body",
  "quote",
];

const ALLOWED = [
  "page",
  "source",
  "plan",
  "previous_plan",
  "cta",
  "surface",
  "variant",
  "host_bucket",
  "invite_kind",
  "days_since_company_created",
  "is_first",
];

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/i;

function sanitizeAnalyticsProps(props) {
  if (!props || typeof props !== "object") return {};
  const out = {};
  const allowed = new Set(ALLOWED);
  const forbidden = new Set(FORBIDDEN);
  for (const [key, value] of Object.entries(props)) {
    if (forbidden.has(key)) continue;
    if (!allowed.has(key)) continue;
    if (value == null) continue;
    if (typeof value === "string") {
      const trimmed = value.trim().slice(0, 64);
      if (!trimmed || EMAIL_RE.test(trimmed)) continue;
      out[key] = trimmed;
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    if (typeof value === "boolean") out[key] = value;
  }
  return out;
}

function parseFirstPartyConsent(raw) {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (v === "0" || v === "deny" || v === "false") return "deny";
  return "allow";
}

function canTrackFirstParty(consent) {
  return consent === "allow";
}

function parseVendorConsent(raw) {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (v === "1" || v === "allow" || v === "true") return "allow";
  return "deny";
}

function shouldEmitOnce(name, alreadyEmitted) {
  if (!ONCE.has(name)) return true;
  return !alreadyEmitted.has(name);
}

function sevenDayActivated(companyCreatedAt, confirmedAt) {
  if (!confirmedAt) return false;
  const created = new Date(companyCreatedAt).getTime();
  const confirmed = new Date(confirmedAt).getTime();
  return confirmed - created <= 7 * 24 * 60 * 60 * 1000;
}

function sevenDayActivationRate(companies) {
  if (!companies.length) return 0;
  const ok = companies.filter((c) =>
    sevenDayActivated(c.createdAt, c.firstConfirmedAt),
  ).length;
  return Math.round((1000 * ok) / companies.length) / 10;
}

test("taxonomy includes required funnel events", () => {
  for (const name of [
    "landing_page_viewed",
    "signup_completed",
    "first_reference_confirmed",
    "checkout_started",
    "subscription_started",
  ]) {
    assert.ok(PRODUCT_EVENTS.includes(name), name);
  }
});

test("sanitize strips emails and forbidden keys", () => {
  const clean = sanitizeAnalyticsProps({
    page: "/pricing",
    email: "a@b.com",
    client_name: "Acme",
    source: "user@evil.com",
    cta: "verify_domain",
    unknown: "x",
  });
  assert.deepEqual(clean, { page: "/pricing", cta: "verify_domain" });
});

test("consent defaults allow first-party; vendors default deny", () => {
  assert.equal(parseFirstPartyConsent(undefined), "allow");
  assert.equal(canTrackFirstParty(parseFirstPartyConsent("0")), false);
  assert.equal(parseVendorConsent(undefined), "deny");
  assert.equal(parseVendorConsent("1"), "allow");
});

test("once-per-company events dedupe", () => {
  const seen = new Set();
  assert.equal(shouldEmitOnce("first_reference_confirmed", seen), true);
  seen.add("first_reference_confirmed");
  assert.equal(shouldEmitOnce("first_reference_confirmed", seen), false);
  assert.equal(shouldEmitOnce("invitation_sent", seen), true);
});

test("seven-day activation rate is the north-star", () => {
  const rate = sevenDayActivationRate([
    {
      createdAt: "2026-08-01T00:00:00Z",
      firstConfirmedAt: "2026-08-05T00:00:00Z",
    },
    {
      createdAt: "2026-08-01T00:00:00Z",
      firstConfirmedAt: "2026-08-12T00:00:00Z",
    },
    { createdAt: "2026-08-01T00:00:00Z", firstConfirmedAt: null },
  ]);
  assert.equal(rate, 33.3);
});
