import "server-only";

import type Stripe from "stripe";
import {
  CHECKOUT_BRANDING,
  CHECKOUT_CUSTOM_TEXT,
} from "@/features/billing/checkout-branding";

type CheckoutInput = {
  stripe: Stripe;
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
};

/** Creates a Pro Checkout Session. Returns null when Stripe rejects the call. */
export async function createProCheckoutSession(
  input: CheckoutInput,
): Promise<Stripe.Checkout.Session | null> {
  const base = {
    mode: "subscription" as const,
    customer: input.customerId,
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    custom_text: CHECKOUT_CUSTOM_TEXT,
    metadata: input.metadata,
    subscription_data: { metadata: input.metadata },
  };

  try {
    return await input.stripe.checkout.sessions.create({
      ...base,
      branding_settings: CHECKOUT_BRANDING,
    } as Parameters<Stripe["checkout"]["sessions"]["create"]>[0]);
  } catch (err) {
    console.error("[billing] checkout with branding failed", err);
    try {
      return await input.stripe.checkout.sessions.create(base);
    } catch (fallback) {
      console.error("[billing] checkout failed", fallback);
      return null;
    }
  }
}
