"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { billingBack } from "@/features/billing/paths";
import { applySubscription } from "@/features/billing/sync";
import { getDashboardSession } from "@/features/dashboard/session";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireOwnerBilling() {
  const { user, company } = await getDashboardSession();
  if (!user || !company) redirect("/login?next=/dashboard/billing");
  if (company.role !== "owner") redirect(billingBack("error=owner_only"));
  if (!isStripeConfigured()) {
    redirect(billingBack("error=stripe_not_configured"));
  }
  return { user, company };
}

/** End Pro at period end — access stays until then. */
export async function cancelProSubscription() {
  const { company } = await requireOwnerBilling();
  const admin = createAdminClient();
  const stripe = getStripe();
  if (!admin || !stripe) redirect(billingBack("error=stripe_not_configured"));

  const { data: billing } = await admin
    .from("company_billing")
    .select("stripe_subscription_id")
    .eq("company_id", company.id)
    .maybeSingle();

  const subId = billing?.stripe_subscription_id?.trim();
  if (!subId) redirect(billingBack("error=no_subscription"));

  const sub = await stripe.subscriptions.update(subId, {
    cancel_at_period_end: true,
  });

  await applySubscription(admin, company.id, sub, String(sub.customer));
  redirect(billingBack("canceled_sub=1"));
}

/** Undo a scheduled cancellation before the period ends. */
export async function resumeProSubscription() {
  const { company } = await requireOwnerBilling();
  const admin = createAdminClient();
  const stripe = getStripe();
  if (!admin || !stripe) redirect(billingBack("error=stripe_not_configured"));

  const { data: billing } = await admin
    .from("company_billing")
    .select("stripe_subscription_id")
    .eq("company_id", company.id)
    .maybeSingle();

  const subId = billing?.stripe_subscription_id?.trim();
  if (!subId) redirect(billingBack("error=no_subscription"));

  const sub = await stripe.subscriptions.update(subId, {
    cancel_at_period_end: false,
  });

  await applySubscription(admin, company.id, sub, String(sub.customer));
  redirect(billingBack("resumed=1"));
}

/**
 * Pro granted outside Stripe (SQL without a subscription row).
 * Uses service_role — clients cannot update companies.plan.
 */
export async function endManualProPlan() {
  const { user, company } = await getDashboardSession();
  if (!user || !company) redirect("/login?next=/dashboard/billing");
  if (company.role !== "owner") redirect(billingBack("error=owner_only"));
  if (company.plan === "founding") {
    redirect(billingBack("error=founding_locked"));
  }
  if (company.plan !== "pro") redirect(billingBack("error=not_pro"));

  const admin = createAdminClient();
  if (!admin) redirect(billingBack("error=stripe_not_configured"));

  const { data: billing } = await admin
    .from("company_billing")
    .select("stripe_subscription_id")
    .eq("company_id", company.id)
    .maybeSingle();

  if (billing?.stripe_subscription_id) {
    redirect(billingBack("error=use_cancel_subscription"));
  }

  await admin.from("companies").update({ plan: "free" }).eq("id", company.id);
  await admin.from("company_billing").upsert({
    company_id: company.id,
    billing_status: "canceled",
    stripe_subscription_id: null,
    cancel_at_period_end: false,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");
  revalidatePath(`/c/${company.slug}`);
  redirect(billingBack("ended_manual=1"));
}
