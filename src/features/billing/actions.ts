"use server";

import { redirect } from "next/navigation";
import {
  CHECKOUT_BRANDING,
  CHECKOUT_CUSTOM_TEXT,
} from "@/features/billing/checkout-branding";
import { proPriceId } from "@/features/billing/config";
import { billingBack } from "@/features/billing/paths";
import { ensureStripeCustomer } from "@/features/billing/sync";
import { getDashboardSession } from "@/features/dashboard/session";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";

export async function startProCheckout() {
  if (!isStripeConfigured()) {
    redirect(billingBack("error=stripe_not_configured"));
  }

  const { user, company } = await getDashboardSession();
  if (!user?.email || !company) {
    redirect("/login?next=/dashboard/billing");
  }
  if (company.role !== "owner") {
    redirect(billingBack("error=owner_only"));
  }
  if (company.plan === "pro" || company.plan === "founding") {
    redirect(billingBack("error=already_pro"));
  }

  const admin = createAdminClient();
  const stripe = getStripe();
  const priceId = proPriceId();
  if (!admin || !stripe || !priceId) {
    redirect(billingBack("error=stripe_not_configured"));
  }

  const customerId = await ensureStripeCustomer(admin, {
    companyId: company.id,
    companyName: company.name,
    companySlug: company.slug,
    ownerEmail: user.email,
  });
  if (!customerId) redirect(billingBack("error=checkout_failed"));

  const site = getSiteUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${site}${billingBack("success=1")}`,
    cancel_url: `${site}${billingBack("canceled=1")}`,
    custom_text: CHECKOUT_CUSTOM_TEXT,
    branding_settings: CHECKOUT_BRANDING,
    metadata: {
      company_id: company.id,
      company_slug: company.slug,
    },
    subscription_data: {
      metadata: {
        company_id: company.id,
        company_slug: company.slug,
      },
    },
  } as Parameters<typeof stripe.checkout.sessions.create>[0]);

  if (!session.url) redirect(billingBack("error=checkout_failed"));

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

export async function openBillingPortal() {
  if (!isStripeConfigured()) {
    redirect(billingBack("error=stripe_not_configured"));
  }

  const { user, company } = await getDashboardSession();
  if (!user || !company) redirect("/login?next=/dashboard/billing");
  if (company.role !== "owner") redirect(billingBack("error=owner_only"));

  const admin = createAdminClient();
  const stripe = getStripe();
  if (!admin || !stripe) redirect(billingBack("error=stripe_not_configured"));

  const { data: billing } = await admin
    .from("company_billing")
    .select("stripe_customer_id")
    .eq("company_id", company.id)
    .maybeSingle();

  if (!billing?.stripe_customer_id) {
    redirect(billingBack("error=no_subscription"));
  }

  const site = getSiteUrl();
  const portal = await stripe.billingPortal.sessions.create({
    customer: billing.stripe_customer_id,
    return_url: `${site}${billingBack()}`,
  });

  redirect(portal.url);
}
