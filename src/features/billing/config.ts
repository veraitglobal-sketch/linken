import "server-only";

/** Display copy — actual charge comes from Stripe Price ID. */
export const PRO_PLAN_LABEL = process.env.STRIPE_PRO_DISPLAY_LABEL?.trim() || "Pro";

/**
 * Keep in sync with Stripe Price `unit_amount` (7900 = €79).
 * Prefer STRIPE_PRO_DISPLAY_PRICE on Vercel so UI never drifts from Checkout.
 */
export const PRO_PLAN_PRICE =
  process.env.STRIPE_PRO_DISPLAY_PRICE?.trim() || "€79 / month";

export function proPriceId(): string | null {
  const id = process.env.STRIPE_PRICE_PRO_MONTHLY?.trim();
  return id || null;
}

/** Must match real gates in `getEntitlements` + product surfaces. */
export const PRO_FEATURES = [
  "Premium embed widgets",
  "Full profile analytics",
  "Branded one-pager",
  "Agent API access",
  "Team seats (up to 25)",
] as const;
