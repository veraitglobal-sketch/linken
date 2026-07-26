import type { Metadata } from "next";
import Link from "next/link";
import { BillingPlanPanel } from "@/components/billing/billing-plan-panel";
import { BillingProAside } from "@/components/billing/billing-pro-aside";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WidgetsFlash } from "@/components/widgets/widgets-flash";
import {
  cancelProSubscription,
  openBillingPortal,
  resumeProSubscription,
  startProCheckout,
} from "@/features/billing/actions";
import {
  PRO_FEATURES,
  PRO_PLAN_LABEL,
  PRO_PLAN_PRICE,
} from "@/features/billing/config";
import { getEntitlements } from "@/features/plan/entitlements";
import { assertCompanySection } from "@/features/workspace/company-gate";
import { isStripeConfigured } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Billing" };

const FLASH: Record<string, string> = {
  success:
    "Welcome to Pro — premium embeds, analytics, Agent API, and team seats are active.",
  canceled: "Checkout canceled. No charge was made.",
  canceled_sub:
    "Subscription canceled. You keep Pro until the end of the current period.",
  resumed: "Subscription resumed. Pro will renew as usual.",
  stripe_not_configured: "Billing is not configured on this environment yet.",
  owner_only: "Only the company owner can manage billing.",
  already_pro: "This company is already on a paid plan.",
  no_subscription: "No Stripe subscription found for this company.",
  checkout_failed: "Could not start checkout. Try again or contact support.",
};

type Props = {
  searchParams: Promise<{
    success?: string;
    canceled?: string;
    canceled_sub?: string;
    resumed?: string;
    error?: string;
  }>;
};

export default async function BillingPage({ searchParams }: Props) {
  const { success, canceled, canceled_sub, resumed, error } =
    await searchParams;
  const { user, company, needsCompanySwitch } =
    await assertCompanySection("settings");

  if (needsCompanySwitch) return <SwitchCompanyNotice title="Billing" />;

  if (!user) {
    return (
      <WorkspacePage title="Billing" description="Manage your Hansala plan.">
        <Link href="/login?next=/dashboard/billing" className="font-semibold text-ink underline">
          Sign in
        </Link>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage title="Billing" description="Manage your Hansala plan.">
        <Link href="/onboarding" className="font-semibold text-ink underline">
          Create your company
        </Link>
      </WorkspacePage>
    );
  }

  const supabase = await createClient();
  const { data: billing } = await supabase
    .from("company_billing")
    .select(
      "stripe_subscription_id, billing_status, plan_period_end, cancel_at_period_end",
    )
    .eq("company_id", company.id)
    .maybeSingle();

  const isOwner = company.role === "owner";
  const entitlements = getEntitlements(company.plan);
  const isPro = entitlements.premiumEmbeds;
  const stripeReady = isStripeConfigured();
  const cancelAtPeriodEnd = Boolean(billing?.cancel_at_period_end);
  const flashKey = success
    ? "success"
    : canceled_sub
      ? "canceled_sub"
      : resumed
        ? "resumed"
        : canceled
          ? "canceled"
          : error;
  const flash = flashKey ? FLASH[flashKey] : null;

  const endDate =
    billing?.plan_period_end &&
    new Date(billing.plan_period_end).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const renewLabel =
    endDate && isPro
      ? cancelAtPeriodEnd
        ? `Cancels ${endDate} — Pro stays active until then`
        : `Renews ${endDate}${billing?.billing_status ? ` · ${billing.billing_status}` : ""}`
      : null;

  return (
    <WorkspacePage
      title="Billing"
      description="Upgrade for premium embeds, full analytics, Agent API, and team seats."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {flash ? (
          <WidgetsFlash tone={error ? "error" : undefined}>{flash}</WidgetsFlash>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-6">
          {!isPro ? (
            <BillingProAside
              label={PRO_PLAN_LABEL}
              price={PRO_PLAN_PRICE}
              features={PRO_FEATURES}
            />
          ) : (
            <BillingProAside
              label={PRO_PLAN_LABEL}
              price={cancelAtPeriodEnd ? "Ending soon" : "Active"}
              features={PRO_FEATURES}
            />
          )}

          <BillingPlanPanel
            companyName={company.name}
            plan={company.plan}
            isPro={isPro}
            isOwner={isOwner}
            stripeReady={stripeReady}
            hasSubscription={Boolean(billing?.stripe_subscription_id)}
            cancelAtPeriodEnd={cancelAtPeriodEnd}
            renewLabel={renewLabel}
            checkoutAction={startProCheckout}
            portalAction={openBillingPortal}
            cancelAction={cancelProSubscription}
            resumeAction={resumeProSubscription}
          />
        </div>
      </div>
    </WorkspacePage>
  );
}
