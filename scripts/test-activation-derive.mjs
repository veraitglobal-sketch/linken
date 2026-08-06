import assert from "node:assert/strict";
import test from "node:test";

/**
 * Mirror of src/features/activation/derive.ts — keep in sync.
 * node --test scripts/test-activation-derive.mjs
 */

function signalsFromRows(input) {
  const hasPartnership = input.partnerships.length > 0;
  const hasEvidence = input.refs.length > 0 || input.caseCount > 0;
  const hasRelationship = hasPartnership || hasEvidence;
  const hasInvitationSent =
    input.refs.some((r) => Boolean(r.invite_email?.trim())) ||
    input.confReqs.some((r) => Boolean(r.email?.trim())) ||
    Boolean(input.hasPartnerInviteSent);
  const hasConfirmation =
    input.refs.some((r) => r.status === "confirmed") ||
    input.partnerships.some((r) => r.status === "accepted") ||
    input.confReqs.some((r) => r.status === "confirmed") ||
    input.hasConfirmedCasePartner;
  return {
    companySlug: input.companySlug,
    verified: input.verified,
    hasRelationship,
    hasInvitationSent,
    hasConfirmation,
    hasProofShared: input.websiteLinked || input.hasEmbedView,
  };
}

function deriveActivationSteps(signals) {
  return [
    { id: "company_profile", done: true },
    { id: "domain_verified", done: signals.verified },
    { id: "first_relationship", done: signals.hasRelationship },
    { id: "first_invitation_sent", done: signals.hasInvitationSent },
    { id: "first_confirmed", done: signals.hasConfirmation },
    { id: "proof_shared", done: signals.hasProofShared },
  ];
}

const empty = {
  companySlug: "acme",
  verified: false,
  refs: [],
  caseCount: 0,
  confReqs: [],
  partnerships: [],
  hasConfirmedCasePartner: false,
  websiteLinked: false,
  hasEmbedView: false,
};

test("new company: only profile step done; next is domain", () => {
  const steps = deriveActivationSteps(signalsFromRows(empty));
  assert.equal(steps.filter((s) => s.done).length, 1);
  assert.equal(steps.find((s) => !s.done)?.id, "domain_verified");
});

test("pending invitation does not count as confirmed", () => {
  const steps = deriveActivationSteps(
    signalsFromRows({
      ...empty,
      verified: true,
      refs: [{ status: "pending", invite_email: "a@client.com" }],
    }),
  );
  assert.equal(steps.find((s) => s.id === "first_invitation_sent")?.done, true);
  assert.equal(steps.find((s) => s.id === "first_confirmed")?.done, false);
});

test("confirmed reference activates without metrics", () => {
  const steps = deriveActivationSteps(
    signalsFromRows({
      ...empty,
      verified: true,
      refs: [{ status: "confirmed", invite_email: null }],
    }),
  );
  assert.equal(steps.find((s) => s.id === "first_confirmed")?.done, true);
  assert.equal(steps.find((s) => s.id === "first_relationship")?.done, true);
});

test("relationship without invite email is not invitation_sent", () => {
  const s = signalsFromRows({
    ...empty,
    caseCount: 1,
    confReqs: [{ status: "pending", email: null }],
  });
  assert.equal(s.hasRelationship, true);
  assert.equal(s.hasInvitationSent, false);
});

test("proof shared via embed_view", () => {
  const s = signalsFromRows({ ...empty, hasEmbedView: true });
  assert.equal(s.hasProofShared, true);
});
