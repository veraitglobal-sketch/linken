"use server";

import { redirect } from "next/navigation";
import { createProCheckoutSession } from "@/features/billing/checkout-session";
import { isOfferCheckoutReady, offerPriceId } from "@/features/billing/config";
import { parseOfferId } from "@/features/billing/offer";
import { ensureStripeCustomer } from "@/features/billing/sync";
import { getDashboardSession } from "@/features/dashboard/session";
import { getStripe } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";

export async function startOfferCheckout(formData: FormData) {
  const offer = parseOfferId(String(formData.get("offer") ?? ""));
  if (!offer) redirect("/offer?error=invalid");
  if (!isOfferCheckoutReady()) redirect("/offer?error=stripe_not_configured");

  const { user, company } = await getDashboardSession();
  if (!user?.email) redirect("/login?next=/offer");
  if (!company) redirect("/onboarding?next=/offer");
  if (company.role !== "owner") redirect("/offer?error=owner_only");
  if (company.plan === "pro" || company.plan === "founding") {
    redirect("/offer?error=already_pro");
  }

  const admin = createAdminClient();
  const stripe = getStripe();
  const priceId = offerPriceId(offer);
  if (!admin || !stripe || !priceId) {
    redirect("/offer?error=stripe_not_configured");
  }

  let customerId: string | null = null;
  try {
    customerId = await ensureStripeCustomer(admin, {
      companyId: company.id,
      companyName: company.name,
      companySlug: company.slug,
      ownerEmail: user.email,
    });
  } catch (err) {
    console.error("[billing] ensureStripeCustomer failed", err);
  }
  if (!customerId) redirect("/offer?error=checkout_failed");

  const site = getSiteUrl();
  const session = await createProCheckoutSession({
    stripe,
    customerId,
    priceId,
    successUrl: `${site}/offer?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${site}/offer?canceled=1`,
    metadata: {
      company_id: company.id,
      company_slug: company.slug,
      offer,
    },
  });

  if (!session?.url) redirect("/offer?error=checkout_failed");

  const { trackLifecycle } = await import(
    "@/features/product-analytics/helpers"
  );
  void trackLifecycle("checkout_started", company.id, {
    plan: "pro",
    previous_plan: "free",
    surface: "web",
  });

  redirect(session.url);
}