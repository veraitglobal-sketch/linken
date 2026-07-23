import "server-only";

import type Stripe from "stripe";
import type { CompanyPlan } from "@/features/plan/entitlements";
import type { SupabaseClient } from "@supabase/supabase-js";

export type BillingRow = {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  billing_status: string | null;
  plan_period_end: string | null;
};

export async function loadBillingRow(
  supabase: SupabaseClient,
  companyId: string,
): Promise<BillingRow | null> {
  const { data } = await supabase
    .from("company_billing")
    .select(
      "stripe_customer_id, stripe_subscription_id, billing_status, plan_period_end",
    )
    .eq("company_id", companyId)
    .maybeSingle();
  return data;
}

function planFromSubscription(status: Stripe.Subscription.Status): CompanyPlan {
  if (status === "active" || status === "trialing") return "pro";
  return "free";
}

/** Webhook + checkout — service_role only. */
export async function applySubscription(
  admin: SupabaseClient,
  companyId: string,
  subscription: Stripe.Subscription,
  customerId: string,
) {
  const { data: company } = await admin
    .from("companies")
    .select("plan")
    .eq("id", companyId)
    .maybeSingle();

  if (company?.plan === "founding") {
    await admin.from("company_billing").upsert({
      company_id: companyId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      billing_status: subscription.status,
      plan_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
    return;
  }

  const nextPlan = planFromSubscription(subscription.status);

  await admin.from("companies").update({ plan: nextPlan }).eq("id", companyId);

  await admin.from("company_billing").upsert({
    company_id: companyId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    billing_status: subscription.status,
    plan_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function downgradeToFree(admin: SupabaseClient, companyId: string) {
  const { data: company } = await admin
    .from("companies")
    .select("plan")
    .eq("id", companyId)
    .maybeSingle();

  if (company?.plan !== "founding") {
    await admin.from("companies").update({ plan: "free" }).eq("id", companyId);
  }

  await admin
    .from("company_billing")
    .update({
      billing_status: "canceled",
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", companyId);
}

export async function ensureStripeCustomer(
  admin: SupabaseClient,
  input: {
    companyId: string;
    companyName: string;
    companySlug: string;
    ownerEmail: string;
  },
): Promise<string | null> {
  const existing = await loadBillingRow(admin, input.companyId);
  if (existing?.stripe_customer_id) return existing.stripe_customer_id;

  const { getStripe } = await import("@/lib/stripe");
  const stripe = getStripe();
  if (!stripe) return null;

  const customer = await stripe.customers.create({
    email: input.ownerEmail,
    name: input.companyName,
    metadata: {
      company_id: input.companyId,
      company_slug: input.companySlug,
    },
  });

  await admin.from("company_billing").upsert({
    company_id: input.companyId,
    stripe_customer_id: customer.id,
    updated_at: new Date().toISOString(),
  });

  return customer.id;
}
