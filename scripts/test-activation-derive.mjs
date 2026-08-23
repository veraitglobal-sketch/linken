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
  const hasConfirmation =
    input.refs.some((r) => r.status === "confirmed") ||
    input.partnerships.some((r) => r.status === "accepted") ||
    input.confReqs.some((r) => r.status === "confirmed") ||
    input.hasConfirmedCasePartner;
  // A confirmation implies an invitation — see derive.ts.
  const hasInvitationSent =
    input.refs.some((r) => Boolean(r.invite_email?.trim())) ||
    input.confReqs.some((r) => Boolean(r.email?.trim())) ||
    Boolean(input.hasPartnerInviteSent) ||
    hasConfirmation;
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

/* The bug this file exists to keep fixed: an accepted partnership records no
   email anywhere, so the explicit invite signals stayed false while the
   confirmation signal went true. The checklist then showed "First reference
   confirmed" ticked above an open "First invitation sent" — a state the
   product cannot produce — and the owner was stuck at 5/6. */
test("an accepted partnership implies the invitation was sent", () => {
  const signals = signalsFromRows({
    companySlug: "vera-it",
    verified: true,
    refs: [],
    caseCount: 1,
    confReqs: [],
    partnerships: [{ status: "accepted" }],
    hasConfirmedCasePartner: false,
    websiteLinked: true,
    hasEmbedView: false,
  });
  assert.equal(signals.hasConfirmation, true);
  assert.equal(signals.hasInvitationSent, true);

  const steps = deriveActivationSteps(signals);
  const invite = steps.find((s) => s.id === "first_invitation_sent");
  const confirmed = steps.find((s) => s.id === "first_confirmed");
  assert.equal(invite.done, true, "invitation must not stay open under a confirmation");
  assert.equal(confirmed.done, true);
  assert.equal(steps.every((s) => s.done), true, "this company is fully activated");
});

test("a confirmed case partner also implies the invitation", () => {
  const signals = signalsFromRows({
    companySlug: "vera-it",
    verified: true,
    refs: [],
    caseCount: 1,
    confReqs: [],
    partnerships: [],
    hasConfirmedCasePartner: true,
    websiteLinked: false,
    hasEmbedView: false,
  });
  assert.equal(signals.hasInvitationSent, true);
});

test("no confirmation and no email still leaves the invitation open", () => {
  const signals = signalsFromRows({
    companySlug: "vera-it",
    verified: true,
    refs: [{ status: "pending", invite_email: null }],
    caseCount: 0,
    confReqs: [],
    partnerships: [],
    hasConfirmedCasePartner: false,
    websiteLinked: false,
    hasEmbedView: false,
  });
  assert.equal(signals.hasInvitationSent, false, "the implication must not fire without a confirmation");
});

/* This file hand-copies `signalsFromRows`, and a copied test once passed green
   in this project while the real function had been inverted. Compare the two
   texts so drift fails here instead of on somebody's dashboard. */
test("the mirror still matches src/features/activation/derive.ts", async () => {
  const { readFile } = await import("node:fs/promises");
  const real = await readFile("src/features/activation/derive.ts", "utf8");
  for (const line of [
    "input.hasConfirmedCasePartner;",
    "Boolean(input.hasPartnerInviteSent) ||",
    "hasConfirmation;",
  ]) {
    assert.ok(real.includes(line), `derive.ts no longer contains: ${line}`);
  }
  const realOrder = real.indexOf("const hasConfirmation") < real.indexOf("const hasInvitationSent");
  assert.equal(realOrder, true, "hasConfirmation must still be computed before hasInvitationSent");
});

/* The partner path records no email, so this flag is the only way an outgoing
   partner request reaches the checklist. It was declared in `derive.ts` from
   the start and never passed by `checklist.ts`, so it sat false forever. */
test("an outgoing partner request counts as an invitation before any answer", () => {
  const signals = signalsFromRows({
    companySlug: "vera-it",
    verified: true,
    refs: [],
    caseCount: 1,
    confReqs: [],
    partnerships: [{ status: "pending" }],
    hasPartnerInviteSent: true,
    hasConfirmedCasePartner: false,
    websiteLinked: false,
    hasEmbedView: false,
  });
  assert.equal(signals.hasConfirmation, false, "nothing is confirmed yet");
  assert.equal(signals.hasInvitationSent, true, "but the request was sent");
});

/* `checklist.ts` must keep selecting the column and passing the flag —
   the query and the mapping are two places this has to stay joined up. */
test("checklist.ts still feeds hasPartnerInviteSent", async () => {
  const { readFile } = await import("node:fs/promises");
  const src = await readFile("src/features/activation/checklist.ts", "utf8");
  assert.ok(
    src.includes("id, status, requester_id"),
    "the partnerships query must still select requester_id",
  );
  assert.ok(
    src.includes("hasPartnerInviteSent:"),
    "checklist.ts must still pass hasPartnerInviteSent",
  );
});

