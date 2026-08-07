import assert from "node:assert/strict";
import test from "node:test";
import {
  API_COMPANY_REQUIRED_KEYS,
  FIXTURES,
  PUBLIC_FORBIDDEN_KEYS,
} from "../fixtures/synthetic.mjs";

/**
 * Integration-style journey (no DB): invite → confirm → visibility rules.
 * npm run test:journeys
 */

function createPendingReference(input) {
  return {
    id: "ref-1",
    providerCompanyId: input.providerId,
    clientName: input.clientName,
    service: input.service,
    status: "pending",
    confirmToken: input.token,
    inviteEmail: input.inviteEmail,
  };
}

function confirmReference(ref, { asCompanyId, sessionEmail }) {
  if (ref.status !== "pending") {
    return { ok: false, error: "already_resolved" };
  }
  if (
    ref.inviteEmail &&
    sessionEmail &&
    ref.inviteEmail.toLowerCase() !== sessionEmail.toLowerCase()
  ) {
    // Soft check — production binds via ownership RPC; mirror intent.
    return { ok: false, error: "email_mismatch" };
  }
  return {
    ok: true,
    ref: {
      ...ref,
      status: "confirmed",
      confirmToken: null,
      inviteEmail: null,
      clientCompanyId: asCompanyId,
      confirmedAt: "2026-01-15T12:00:00.000Z",
    },
  };
}

function publicReferencesForProvider(refs) {
  return refs.filter((r) => r.status === "confirmed");
}

function publicProvidersForClient(refs, clientCompanyId) {
  return refs.filter(
    (r) => r.status === "confirmed" && r.clientCompanyId === clientCompanyId,
  );
}

function assertNoSecrets(payload) {
  const json = JSON.stringify(payload);
  for (const key of PUBLIC_FORBIDDEN_KEYS) {
    assert.equal(
      json.includes(`"${key}"`),
      false,
      `public payload must not include ${key}`,
    );
  }
}

test("journey: pending invitation stays private", () => {
  const pending = createPendingReference({
    providerId: FIXTURES.provider.id,
    clientName: FIXTURES.client.name,
    service: "Architecture",
    token: FIXTURES.tokens.confirmReference,
    inviteEmail: FIXTURES.client.email,
  });
  assert.deepEqual(publicReferencesForProvider([pending]), []);
  assert.deepEqual(publicProvidersForClient([pending], FIXTURES.client.id), []);
  assertNoSecrets({
    slug: FIXTURES.provider.slug,
    references: publicReferencesForProvider([pending]),
  });
});

test("journey: confirmed relationship is public on both sides", () => {
  const pending = createPendingReference({
    providerId: FIXTURES.provider.id,
    clientName: FIXTURES.client.name,
    service: "Architecture",
    token: FIXTURES.tokens.confirmReference,
    inviteEmail: FIXTURES.client.email,
  });
  const result = confirmReference(pending, {
    asCompanyId: FIXTURES.client.id,
    sessionEmail: FIXTURES.client.email,
  });
  assert.equal(result.ok, true);
  const refs = [result.ref];
  const onProvider = publicReferencesForProvider(refs);
  const onClient = publicProvidersForClient(refs, FIXTURES.client.id);
  assert.equal(onProvider.length, 1);
  assert.equal(onClient.length, 1);
  assert.equal(onProvider[0].status, "confirmed");
  assert.equal(onProvider[0].confirmToken, null);
  assert.equal(onProvider[0].inviteEmail, null);
  assertNoSecrets(onProvider[0]);
});

test("journey: duplicate confirmation is rejected", () => {
  const pending = createPendingReference({
    providerId: FIXTURES.provider.id,
    clientName: FIXTURES.client.name,
    service: "Architecture",
    token: FIXTURES.tokens.confirmReference,
    inviteEmail: FIXTURES.client.email,
  });
  const first = confirmReference(pending, {
    asCompanyId: FIXTURES.client.id,
    sessionEmail: FIXTURES.client.email,
  });
  const second = confirmReference(first.ref, {
    asCompanyId: FIXTURES.client.id,
    sessionEmail: FIXTURES.client.email,
  });
  assert.equal(second.ok, false);
  assert.equal(second.error, "already_resolved");
});

test("journey: claim requires invite email match", () => {
  function canClaim(inviteEmail, sessionEmail) {
    if (!sessionEmail) return false;
    if (!inviteEmail) return true;
    return inviteEmail.toLowerCase() === sessionEmail.toLowerCase();
  }
  assert.equal(canClaim(FIXTURES.client.email, FIXTURES.client.email), true);
  assert.equal(canClaim(FIXTURES.client.email, FIXTURES.provider.email), false);
});

test("API contract: company response shape keys", () => {
  const sample = {
    slug: FIXTURES.provider.slug,
    name: FIXTURES.provider.name,
    category: "Architecture",
    city: "Test City",
    country: "DE",
    website: FIXTURES.provider.website,
    verified: true,
    claimed: true,
    accepting_clients: true,
    trust_level: "member",
    stats: {
      confirmed_partners: 0,
      confirmed_references: 1,
      ongoing_references: 0,
      confirmed_case_studies: 0,
    },
    assessment: null,
    profile_url: `https://hansala.com/c/${FIXTURES.provider.slug}`,
    generated_at: "2026-01-15T12:00:00.000Z",
  };
  for (const key of API_COMPANY_REQUIRED_KEYS) {
    assert.ok(key in sample, `missing ${key}`);
  }
  assertNoSecrets(sample);
});

test("billing journey: cancel Pro returns free entitlements", () => {
  function entitlements(plan) {
    return plan === "pro"
      ? { agentApi: true, premiumEmbeds: true }
      : { agentApi: false, premiumEmbeds: false };
  }
  function afterCancel(status) {
    if (status === "canceled" || status === "unpaid") return "free";
    if (status === "active" || status === "trialing") return "pro";
    return "free";
  }
  assert.equal(entitlements("pro").agentApi, true);
  assert.equal(entitlements(afterCancel("canceled")).agentApi, false);
  assert.equal(entitlements(afterCancel("active")).premiumEmbeds, true);
});
