/** Display price / billing unit — no Stripe secrets. */

export const PRO_PLAN_LABEL =
  process.env.STRIPE_PRO_DISPLAY_LABEL?.trim() || "Pro";

/** Default matches scripts/stripe-setup.mjs (EUR 7900 / month). */
export const PRO_PLAN_PRICE =
  process.env.STRIPE_PRO_DISPLAY_PRICE?.trim() || "€79 / month";

export const FREE_PLAN_PRICE = "€0";

/** Billing unit — matches Stripe Checkout (company subscription). */
export const BILLING_UNIT =
  "Per company workspace (not per user seat beyond the plan limit).";

/** Annual billing is not configured in Stripe yet. */
export const ANNUAL_BILLING_AVAILABLE = false;

export type PricingCtaMode = "checkout_path" | "waitlist";

export function pricingCtaMode(stripeReady: boolean): PricingCtaMode {
  return stripeReady ? "checkout_path" : "waitlist";
}

export function proCta(stripeReady: boolean): { href: string; label: string } {
  if (stripeReady) {
    return {
      href: "/onboarding",
      label: "Start free — upgrade in Billing",
    };
  }
  return { href: "/contact", label: "Contact us about Pro" };
}
