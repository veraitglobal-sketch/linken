import assert from "node:assert/strict";
import test from "node:test";

/**
 * Mirror of growth-loop match / claim / visibility / opt-out helpers.
 * npm run test:growth
 */

function emailDomain(email) {
  const at = String(email).toLowerCase().lastIndexOf("@");
  if (at < 0) return null;
  return String(email)
    .slice(at + 1)
    .trim()
    .toLowerCase() || null;
}

const PUBLIC = new Set(["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]);

function isPublic(d) {
  return Boolean(d && PUBLIC.has(d));
}

function extractDomain(website) {
  try {
    const u = new URL(
      /^https?:\/\//i.test(website) ? website : `https://${website}`,
    );
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchInvitedCompany(input) {
  if (input.clientCompanyId) {
    const hit = input.candidates.find((c) => c.id === input.clientCompanyId);
    if (hit) return { status: "matched", companyId: hit.id, reason: "id" };
  }
  const mail = input.inviteEmail ? emailDomain(input.inviteEmail) : null;
  const inviteDomain = mail && !isPublic(mail) ? mail : null;
  const nameKey = normalizeName(input.clientName);
  if (nameKey.length >= 2) {
    const byName = input.candidates.filter(
      (c) => c.claimed && normalizeName(c.name) === nameKey,
    );
    if (byName.length === 1) {
      const site = extractDomain(byName[0].website ?? "");
      if (inviteDomain && site && site !== inviteDomain) {
        return { status: "domain_mismatch", companyId: byName[0].id };
      }
      return { status: "matched", companyId: byName[0].id, reason: "name" };
    }
  }
  if (inviteDomain) {
    const byDomain = input.candidates.filter((c) => {
      if (!c.claimed) return false;
      return extractDomain(c.website ?? "") === inviteDomain;
    });
    if (byDomain.length === 1) {
      return { status: "matched", companyId: byDomain[0].id, reason: "domain" };
    }
  }
  return { status: "none" };
}

function claimDomainMismatch(inviteEmail, website) {
  const mail = inviteEmail ? emailDomain(inviteEmail) : null;
  if (!mail || isPublic(mail)) return false;
  const site = extractDomain(website ?? "");
  if (!site) return false;
  return site !== mail;
}

function canClaim(input) {
  if (!input.token) return { ok: false, reason: "unauthorized" };
  if (input.alreadyClaimed) return { ok: false, reason: "duplicate" };
  if (input.token !== input.expectedToken) return { ok: false, reason: "unauthorized" };
  return { ok: true };
}

function publicRelationshipVisible(status, side) {
  if (status !== "confirmed" && status !== "accepted") return false;
  return side === "provider" || side === "client" || side === "partner";
}

function remindersAllowed(prefs) {
  return prefs.inviteRemindersEnabled !== false;
}

function inviteLimitReached(sentToday, limit = 20) {
  return sentToday >= limit;
}

const existing = {
  id: "co-1",
  name: "Acme GmbH",
  website: "https://acme.de",
  claimed: true,
};

test("existing company recipient matches by id", () => {
  const r = matchInvitedCompany({
    clientCompanyId: "co-1",
    clientName: "Other",
    inviteEmail: "a@acme.de",
    candidates: [existing],
  });
  assert.equal(r.status, "matched");
  assert.equal(r.reason, "id");
});

test("new company recipient returns none", () => {
  const r = matchInvitedCompany({
    clientCompanyId: null,
    clientName: "Brand New Co",
    inviteEmail: "hello@brandnew.example",
    candidates: [existing],
  });
  assert.equal(r.status, "none");
});

test("domain mismatch when name matches but email domain differs", () => {
  const r = matchInvitedCompany({
    clientCompanyId: null,
    clientName: "Acme GmbH",
    inviteEmail: "a@other.de",
    candidates: [existing],
  });
  assert.equal(r.status, "domain_mismatch");
});

test("duplicate company claim is rejected", () => {
  const r = canClaim({
    token: "tok",
    expectedToken: "tok",
    alreadyClaimed: true,
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "duplicate");
});

test("unauthorized company claim without valid token", () => {
  const r = canClaim({
    token: "wrong",
    expectedToken: "tok",
    alreadyClaimed: false,
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "unauthorized");
});

test("relationship visibility on both profiles after mutual approval", () => {
  assert.equal(publicRelationshipVisible("confirmed", "provider"), true);
  assert.equal(publicRelationshipVisible("confirmed", "client"), true);
  assert.equal(publicRelationshipVisible("pending", "provider"), false);
  assert.equal(publicRelationshipVisible("pending", "client"), false);
  assert.equal(publicRelationshipVisible("accepted", "partner"), true);
});

test("opt-out blocks reminders; claim domain warn is advisory", () => {
  assert.equal(remindersAllowed({ inviteRemindersEnabled: false }), false);
  assert.equal(remindersAllowed({ inviteRemindersEnabled: true }), true);
  assert.equal(claimDomainMismatch("a@acme.de", "https://other.de"), true);
  assert.equal(claimDomainMismatch("a@gmail.com", "https://acme.de"), false);
  assert.equal(inviteLimitReached(20), true);
  assert.equal(inviteLimitReached(19), false);
});

const BENEFIT =
  "You have confirmed this project for the other company. Create your free profile to display the same verified work and collect your own references.";

test("post-confirm benefit copy is exact and respectful", () => {
  assert.equal(
    BENEFIT,
    "You have confirmed this project for the other company. Create your free profile to display the same verified work and collect your own references.",
  );
});

function sanitizeReferralSlug(raw) {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s || s.length > 80) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) return null;
  return s;
}

test("referral attribution accepts public slug only — never email", () => {
  assert.equal(sanitizeReferralSlug("acme-gmbh"), "acme-gmbh");
  assert.equal(sanitizeReferralSlug("a@acme.de"), null);
  assert.equal(sanitizeReferralSlug("../evil"), null);
  assert.equal(sanitizeReferralSlug(""), null);
});
