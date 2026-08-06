import {
  getEntitlements,
  isPaidPlan,
  parsePlan,
  type CompanyPlan,
  type Entitlements,
} from "@/features/plan/entitlements";

export type BillingStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | string
  | null
  | undefined;

/**
 * Mirrors Stripe sync: only active/trialing keep Pro.
 * past_due / unpaid / canceled → Free entitlements (unless founding).
 */
export function planFromSubscriptionStatus(
  status: BillingStatus,
  currentPlan?: CompanyPlan | string | null,
): CompanyPlan {
  if (parsePlan(currentPlan) === "founding") return "founding";
  if (status === "active" || status === "trialing") return "pro";
  return "free";
}

export function entitlementsForPlan(
  plan: CompanyPlan | string | null | undefined,
): Entitlements {
  return getEntitlements(parsePlan(plan));
}

/** Effective plan after applying subscription status (e.g. expired). */
export function effectivePlan(input: {
  plan: CompanyPlan | string | null | undefined;
  billingStatus?: BillingStatus;
}): CompanyPlan {
  const plan = parsePlan(input.plan);
  if (plan === "founding") return "founding";
  if (input.billingStatus === undefined) return plan;
  return planFromSubscriptionStatus(input.billingStatus, plan);
}

export function canUsePremiumEmbeds(plan: CompanyPlan | string | null) {
  return entitlementsForPlan(plan).premiumEmbeds;
}

export function canUseAgentApi(plan: CompanyPlan | string | null) {
  return entitlementsForPlan(plan).agentApi;
}

export function canUseFullAnalytics(plan: CompanyPlan | string | null) {
  return entitlementsForPlan(plan).fullAnalytics;
}

export function canUseBrandedOnePager(plan: CompanyPlan | string | null) {
  return entitlementsForPlan(plan).onePagerBranding;
}

export function teamSeatLimit(plan: CompanyPlan | string | null) {
  return entitlementsForPlan(plan).maxTeamMembers;
}

/** After cancel at period end, still paid until period ends (status still active). */
export function isCancelScheduled(input: {
  cancelAtPeriodEnd?: boolean | null;
  billingStatus?: BillingStatus;
}) {
  return Boolean(
    input.cancelAtPeriodEnd &&
      (input.billingStatus === "active" || input.billingStatus === "trialing"),
  );
}

export function isBillingFailure(status: BillingStatus) {
  return status === "past_due" || status === "unpaid";
}

export { isPaidPlan, parsePlan, getEntitlements };
