import assert from "node:assert/strict";
import test from "node:test";

/**
 * Authorization / tenant isolation / SSRF helpers.
 * npm run test:security
 */

function isPrivateOrSpecialIp(ip) {
  if (ip === "0.0.0.0" || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("127.")) return true;
  if (ip.startsWith("169.254.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(ip)) return true;
  const lower = String(ip).toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  if (lower.startsWith("fe80")) return true;
  return false;
}

function isBlockedHostname(hostname) {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (host === "localhost" || host === "metadata.google.internal") return true;
  if (host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host.endsWith(".internal")) return true;
  if (host === "metadata" || host.startsWith("metadata.")) return true;
  return false;
}

function normalizeWebhookUrl(raw) {
  try {
    const parsed = new URL(String(raw).trim());
    if (parsed.protocol !== "https:") return { ok: false };
    if (parsed.username || parsed.password) return { ok: false };
    if (isBlockedHostname(parsed.hostname)) return { ok: false };
    if (/^\d+\.\d+\.\d+\.\d+$/.test(parsed.hostname) && isPrivateOrSpecialIp(parsed.hostname)) {
      return { ok: false };
    }
    return { ok: true, url: parsed.toString() };
  } catch {
    return { ok: false };
  }
}

/** Claim binding: invite email must match session when set. */
function canClaimCompany(inviteEmail, sessionEmail) {
  if (!sessionEmail) return false;
  if (!inviteEmail || !String(inviteEmail).trim()) return true;
  return (
    String(inviteEmail).trim().toLowerCase() ===
    String(sessionEmail).trim().toLowerCase()
  );
}

/** Pending refs must not be public. */
function publicReferenceVisible(status) {
  return status === "confirmed";
}

/** Add-workspace must never return claim tokens. */
function sanitizeLookupResult(row) {
  const { claim_token: _t, ...safe } = row;
  return safe;
}

test("SSRF: private and metadata hosts blocked for webhooks", () => {
  assert.equal(normalizeWebhookUrl("https://169.254.169.254/").ok, false);
  assert.equal(normalizeWebhookUrl("https://10.0.0.5/hook").ok, false);
  assert.equal(normalizeWebhookUrl("https://192.168.1.1/x").ok, false);
  assert.equal(normalizeWebhookUrl("https://100.64.1.1/x").ok, false);
  assert.equal(normalizeWebhookUrl("https://localhost/hook").ok, false);
  assert.equal(normalizeWebhookUrl("https://metadata.google.internal/").ok, false);
  assert.equal(normalizeWebhookUrl("http://example.com/hook").ok, false);
  assert.equal(normalizeWebhookUrl("https://hooks.example.com/v1").ok, true);
});

test("tenant: claim requires invite email match when set", () => {
  assert.equal(canClaimCompany("a@acme.de", "a@acme.de"), true);
  assert.equal(canClaimCompany("a@acme.de", "other@acme.de"), false);
  assert.equal(canClaimCompany(null, "a@acme.de"), true);
  assert.equal(canClaimCompany("", "a@acme.de"), true);
  assert.equal(canClaimCompany("a@acme.de", ""), false);
});

test("tenant: pending references are not public", () => {
  assert.equal(publicReferenceVisible("pending"), false);
  assert.equal(publicReferenceVisible("confirmed"), true);
  assert.equal(publicReferenceVisible("declined"), false);
});

test("authz: lookup payloads must not include claim_token", () => {
  const safe = sanitizeLookupResult({
    id: "1",
    name: "Acme",
    claim_token: "secret-uuid",
    invite_email: "a@acme.de",
  });
  assert.equal("claim_token" in safe, false);
  assert.equal(safe.invite_email, "a@acme.de");
});

test("rate limit helper rejects after window capacity", () => {
  const buckets = new Map();
  function take(key, limit) {
    const b = buckets.get(key) ?? { count: 0 };
    if (b.count >= limit) return false;
    b.count += 1;
    buckets.set(key, b);
    return true;
  }
  assert.equal(take("ip:1", 2), true);
  assert.equal(take("ip:1", 2), true);
  assert.equal(take("ip:1", 2), false);
});
