import "server-only";

/** Display copy — actual charge comes from Stripe Price. */
export const PRO_PLAN_LABEL = process.env.STRIPE_PRO_DISPLAY_LABEL?.trim() || "Pro";

export const PRO_PLAN_PRICE =
  process.env.STRIPE_PRO_DISPLAY_PRICE?.trim() || "€79 / month";

export function proPriceId(): string | null {
  const id = process.env.STRIPE_PRICE_PRO_MONTHLY?.trim();
  return id || null;
}

export const PRO_FEATURES = [
  "Premium embed widgets (Starter, TrustScore, Signature)",
  "Full profile analytics",
  "Branded one-pager",
  "Instant inquiry notifications",
  "Agent API & team seats",
] as const;
