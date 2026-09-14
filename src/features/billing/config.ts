import "server-only";

import type { OfferId } from "@/features/billing/offer";

export {
  PRO_PLAN_LABEL,
  PRO_PLAN_PRICE,
  PRO_HIGHLIGHTS as PRO_FEATURES,
} from "@/features/plan/pricing";

export function proPriceId(): string | null {
  const id = process.env.STRIPE_PRICE_PRO_MONTHLY?.trim();
  return id || null;
}

export function offerPriceId(id: OfferId): string | null {
  const key =
    id === "six" ? "STRIPE_PRICE_PRO_USD_6MO" : "STRIPE_PRICE_PRO_USD_YEAR";
  const value = process.env[key]?.trim();
  return value || null;
}

export function isOfferCheckoutReady(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_WEBHOOK_SECRET?.trim() &&
      offerPriceId("six") &&
      offerPriceId("year"),
  );
}
