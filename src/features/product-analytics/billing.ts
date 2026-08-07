import "server-only";

import { trackLifecycle } from "@/features/product-analytics/helpers";
import type { CompanyPlan } from "@/features/plan/entitlements";

/** Map Stripe subscription outcomes to revenue events — no PII. */
export async function trackBillingLifecycle(input: {
  companyId: string;
  event:
    | "subscription_started"
    | "subscription_upgraded"
    | "subscription_downgraded"
    | "subscription_cancelled"
    | "payment_failed";
  plan?: CompanyPlan;
  previousPlan?: CompanyPlan;
}) {
  await trackLifecycle(input.event, input.companyId, {
    plan: input.plan,
    previous_plan: input.previousPlan,
    surface: "webhook",
  });
}

export function inferSubscriptionChange(input: {
  previousPlan: CompanyPlan | null | undefined;
  nextPlan: CompanyPlan;
  isNewCheckout: boolean;
}): "subscription_started" | "subscription_upgraded" | "subscription_downgraded" | null {
  if (input.isNewCheckout && input.nextPlan === "pro") {
    return "subscription_started";
  }
  const prev = input.previousPlan ?? "free";
  if (prev === "free" && input.nextPlan === "pro") {
    return "subscription_started";
  }
  if (prev === "pro" && input.nextPlan === "free") {
    return "subscription_downgraded";
  }
  if (prev === "free" && input.nextPlan === "founding") {
    return "subscription_upgraded";
  }
  if (prev === "pro" && input.nextPlan === "founding") {
    return "subscription_upgraded";
  }
  return null;
}
