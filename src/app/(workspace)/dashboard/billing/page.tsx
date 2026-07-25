import type { Metadata } from "next";
import Link from "next/link";
import { BillingPlanPanel } from "@/components/billing/billing-plan-panel";
import { BillingProAside } from "@/components/billing/billing-pro-aside";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WidgetsFlash } from "@/components/widgets/widgets-flash";
import {
  openBillingPortal,
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
  success: "Welcome to Pro — your widgets and analytics unlock immediately.",
  canceled: "Checkout canceled. No charge was made.",
  stripe_not_configured: "Billing is not configured on this environment yet.",
  owner_only: "Only the company owner can manage billing.",
  already_pro: "This company is already on a paid plan.",
  no_subscription: "No Stripe subscription found for this company.",
  checkout_failed: "Could not start checkout. Try again or contact support.",
};

type Props = {
  searchParams: Promise<{ success?: string; canceled?: string; error?: string }>;
};

export default async function BillingPage({ searchParams }: Props) {
  const { success, canceled, error } = await searchParams;
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
    .select("stripe_subscription_id, billing_status, plan_period_end")
    .eq("company_id", company.id)
    .maybeSingle();

  const isOwner = company.role === "owner";
  const entitlements = getEntitlements(company.plan);
  const isPro = entitlements.logoWallWidget;
  const stripeReady = isStripeConfigured();
  const flashKey = success ? "success" : canceled ? "canceled" : error;
  const flash = flashKey ? FLASH[flashKey] : null;

  const renewLabel =
    billing?.plan_period_end && isPro
      ? `Renews ${new Date(billing.plan_period_end).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}${billing.billing_status ? ` · ${billing.billing_status}` : ""}`
      : null;

  return (
    <WorkspacePage
      title="Billing"
      description="Upgrade for premium widgets, analytics, and Pro embeds."
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
              price="Active"
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
            renewLabel={renewLabel}
            checkoutAction={startProCheckout}
            portalAction={openBillingPortal}
          />
        </div>
      </div>
    </WorkspacePage>
  );
}
