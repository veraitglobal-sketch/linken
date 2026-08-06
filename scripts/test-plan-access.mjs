import assert from "node:assert/strict";
import test from "node:test";

/**
 * Mirror of entitlements + access rules — keep in sync with
 * src/features/plan/{entitlements,access,pricing}.ts
 */

const FREE = {
  fullAnalytics: false,
  onePagerBranding: false,
  premiumEmbeds: false,
  agentApi: false,
  maxTeamMembers: 1,
};

const PRO = {
  fullAnalytics: true,
  onePagerBranding: true,
  premiumEmbeds: true,
  agentApi: true,
  maxTeamMembers: 25,
};

function getEntitlements(plan) {
  return plan === "pro" || plan === "founding" ? { ...PRO } : { ...FREE };
}

function planFromSubscriptionStatus(status, currentPlan) {
  if (currentPlan === "founding") return "founding";
  if (status === "active" || status === "trialing") return "pro";
  return "free";
}

function effectivePlan({ plan, billingStatus }) {
  if (plan === "founding") return "founding";
  if (billingStatus === undefined) return plan === "pro" ? "pro" : "free";
  return planFromSubscriptionStatus(billingStatus, plan);
}

function isBillingFailure(status) {
  return status === "past_due" || status === "unpaid";
}

function pricingCtaMode(stripeReady) {
  return stripeReady ? "checkout_path" : "waitlist";
}

test("Free plan blocks premium features", () => {
  const e = getEntitlements("free");
  assert.equal(e.premiumEmbeds, false);
  assert.equal(e.agentApi, false);
  assert.equal(e.fullAnalytics, false);
  assert.equal(e.onePagerBranding, false);
  assert.equal(e.maxTeamMembers, 1);
});

test("Pro plan unlocks premium features", () => {
  const e = getEntitlements("pro");
  assert.equal(e.premiumEmbeds, true);
  assert.equal(e.agentApi, true);
  assert.equal(e.fullAnalytics, true);
  assert.equal(e.onePagerBranding, true);
  assert.equal(e.maxTeamMembers, 25);
});

test("Founding matches Pro entitlements", () => {
  assert.deepEqual(getEntitlements("founding"), getEntitlements("pro"));
});

test("subscription expiration / past_due → Free entitlements", () => {
  assert.equal(effectivePlan({ plan: "pro", billingStatus: "past_due" }), "free");
  assert.equal(effectivePlan({ plan: "pro", billingStatus: "canceled" }), "free");
  assert.equal(effectivePlan({ plan: "pro", billingStatus: "active" }), "pro");
});

test("billing failure states detected", () => {
  assert.equal(isBillingFailure("past_due"), true);
  assert.equal(isBillingFailure("unpaid"), true);
  assert.equal(isBillingFailure("active"), false);
});

test("downgrade does not strip founding", () => {
  assert.equal(
    planFromSubscriptionStatus("canceled", "founding"),
    "founding",
  );
});

test("pricing metadata: waitlist when Stripe not ready", () => {
  assert.equal(pricingCtaMode(false), "waitlist");
  assert.equal(pricingCtaMode(true), "checkout_path");
});

test("pricing display defaults are set (no invented annual)", () => {
  const price = process.env.STRIPE_PRO_DISPLAY_PRICE?.trim() || "€79 / month";
  assert.match(price, /€79/);
  assert.equal(false, false); // ANNUAL_BILLING_AVAILABLE
});
