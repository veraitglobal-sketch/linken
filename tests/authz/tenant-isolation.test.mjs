import assert from "node:assert/strict";
import test from "node:test";
import { FIXTURES } from "../fixtures/synthetic.mjs";

/**
 * Authorization / tenant isolation (pure helpers).
 * Complements scripts/test-security.mjs
 * npm run test:authz
 */

function operatorCanMutate(actorCompanyId, targetCompanyId) {
  return actorCompanyId === targetCompanyId;
}

function claimAllowed({ inviteEmail, sessionEmail, tokenPresent }) {
  if (!tokenPresent) return { ok: false, reason: "unauthorized" };
  if (!sessionEmail) return { ok: false, reason: "unauthorized" };
  if (inviteEmail && inviteEmail.toLowerCase() !== sessionEmail.toLowerCase()) {
    return { ok: false, reason: "email_mismatch" };
  }
  return { ok: true };
}

function analyticsCompanyId(clientSupplied, sessionCompanyId) {
  // Server must ignore client-supplied IDs.
  return sessionCompanyId ?? null;
}

test("authz: operator cannot mutate another company", () => {
  assert.equal(
    operatorCanMutate(FIXTURES.provider.id, FIXTURES.client.id),
    false,
  );
  assert.equal(
    operatorCanMutate(FIXTURES.provider.id, FIXTURES.provider.id),
    true,
  );
});

test("authz: unauthorized and duplicate claim paths", () => {
  assert.equal(
    claimAllowed({
      inviteEmail: FIXTURES.client.email,
      sessionEmail: FIXTURES.provider.email,
      tokenPresent: true,
    }).reason,
    "email_mismatch",
  );
  assert.equal(
    claimAllowed({
      inviteEmail: FIXTURES.client.email,
      sessionEmail: null,
      tokenPresent: true,
    }).reason,
    "unauthorized",
  );
  assert.equal(
    claimAllowed({
      inviteEmail: FIXTURES.client.email,
      sessionEmail: FIXTURES.client.email,
      tokenPresent: false,
    }).reason,
    "unauthorized",
  );
  assert.equal(
    claimAllowed({
      inviteEmail: FIXTURES.client.email,
      sessionEmail: FIXTURES.client.email,
      tokenPresent: true,
    }).ok,
    true,
  );
});

test("authz: analytics events use session company not client UUID", () => {
  assert.equal(
    analyticsCompanyId(FIXTURES.client.id, FIXTURES.provider.id),
    FIXTURES.provider.id,
  );
  assert.equal(analyticsCompanyId(FIXTURES.client.id, null), null);
});
