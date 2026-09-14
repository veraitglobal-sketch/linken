import "server-only";

import { applySubscription } from "@/features/billing/sync";
import { getDashboardSession } from "@/features/dashboard/session";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/** Activate Pro from Checkout return — webhook remains the source of truth. */
export async function fulfillOfferSession(sessionId: string) {
  if (!sessionId.startsWith("cs_")) return;
  const { company } = await getDashboardSession();
  if (!company) return;

  const stripe = getStripe();
  const admin = createAdminClient();
  if (!stripe || !admin) return;

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.mode !== "subscription") return;
  if (session.status !== "complete") return;
  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    return;
  }
  if (session.metadata?.company_id !== company.id) return;

  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  if (!subId) return;

  const sub = await stripe.subscriptions.retrieve(subId);
  const customerId = String(session.customer ?? sub.customer);
  await applySubscription(admin, company.id, sub, customerId);
}