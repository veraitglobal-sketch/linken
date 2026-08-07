import assert from "node:assert/strict";
import test from "node:test";

/** Mirror src/features/dashboard/home-state.ts */

function deriveHomeKind(s) {
  if (!s.hasCompany) return "no_company";
  if (s.billingProblem) return "billing_problem";
  if (!s.verified) return "unverified";
  if (s.relationshipCount === 0) return "no_projects";
  if (!s.invitationSent) return "no_invitation";
  if (s.pendingInvites > 0 && s.confirmedCount === 0) {
    return "invitation_pending";
  }
  if (s.confirmedCount === 1 && !s.isPro) return "first_confirmed";
  if (s.isPro && s.confirmedCount >= 1) return "pro_active";
  if (s.confirmedCount >= 2) return "active";
  if (s.confirmedCount >= 1) return "first_confirmed";
  return "invitation_pending";
}

function primaryActionFor(kind) {
  const map = {
    no_company: "create_company",
    billing_problem: "fix_billing",
    unverified: "verify_domain",
    no_projects: "add_relationship",
    no_invitation: "send_invite",
    invitation_pending: "follow_up",
    first_confirmed: "share_proof",
    pro_active: "add_another",
    active: "add_another",
  };
  return map[kind];
}

const base = {
  hasCompany: true,
  verified: true,
  relationshipCount: 0,
  invitationSent: false,
  pendingInvites: 0,
  confirmedCount: 0,
  proofShared: false,
  isPro: false,
  billingProblem: false,
  profileComplete: false,
};

test("no company", () => {
  assert.equal(deriveHomeKind({ ...base, hasCompany: false }), "no_company");
});

test("unverified company", () => {
  assert.equal(deriveHomeKind({ ...base, verified: false }), "unverified");
});

test("no projects", () => {
  assert.equal(deriveHomeKind(base), "no_projects");
});

test("project without invitation", () => {
  assert.equal(
    deriveHomeKind({ ...base, relationshipCount: 1, invitationSent: false }),
    "no_invitation",
  );
});

test("invitation pending", () => {
  assert.equal(
    deriveHomeKind({
      ...base,
      relationshipCount: 1,
      invitationSent: true,
      pendingInvites: 2,
      confirmedCount: 0,
    }),
    "invitation_pending",
  );
});

test("first confirmation completed", () => {
  assert.equal(
    deriveHomeKind({
      ...base,
      relationshipCount: 1,
      invitationSent: true,
      confirmedCount: 1,
    }),
    "first_confirmed",
  );
  assert.equal(primaryActionFor("first_confirmed"), "share_proof");
});

test("active with multiple references", () => {
  assert.equal(
    deriveHomeKind({
      ...base,
      relationshipCount: 3,
      invitationSent: true,
      confirmedCount: 3,
    }),
    "active",
  );
});

test("Pro customer", () => {
  assert.equal(
    deriveHomeKind({
      ...base,
      relationshipCount: 2,
      invitationSent: true,
      confirmedCount: 2,
      isPro: true,
    }),
    "pro_active",
  );
});

test("billing problem takes priority over unverified", () => {
  assert.equal(
    deriveHomeKind({
      ...base,
      verified: false,
      billingProblem: true,
    }),
    "billing_problem",
  );
  assert.equal(primaryActionFor("billing_problem"), "fix_billing");
});
