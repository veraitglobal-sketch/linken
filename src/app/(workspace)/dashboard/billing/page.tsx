import type { Metadata } from "next";
import Link from "next/link";
import { BillingActions, PlanBadge } from "@/components/billing/billing-actions";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WidgetsFlash } from "@/components/widgets/widgets-flash";
import {
  openBillingPortal,
  startProCheckout,
} from "@/features/billing/actions";
import { PRO_FEATURES, PRO_PLAN_LABEL, PRO_PLAN_PRICE } from "@/features/billing/config";
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

  return (
    <WorkspacePage
      title="Billing"
      description="Upgrade for premium widgets, analytics, and Pro embeds."
    >
      <div className="mx-auto max-w-2xl space-y-8">
        {flash ? (
          <WidgetsFlash tone={error ? "error" : undefined}>{flash}</WidgetsFlash>
        ) : null}

        <section className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
                Current plan
              </p>
              <div className="mt-2 flex items-center gap-3">
                <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
                  {company.name}
                </h2>
                <PlanBadge plan={company.plan} />
              </div>
              {billing?.plan_period_end && isPro ? (
                <p className="mt-2 text-[13px] text-muted">
                  Renews{" "}
                  {new Date(billing.plan_period_end).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {billing.billing_status ? ` · ${billing.billing_status}` : ""}
                </p>
              ) : null}
            </div>
          </div>

          {!isOwner ? (
            <p className="mt-4 text-[13px] text-muted">
              Ask your company owner to upgrade or manage billing.
            </p>
          ) : (
            <div className="mt-6">
              <BillingActions
                isPro={isPro}
                hasSubscription={Boolean(billing?.stripe_subscription_id)}
                stripeReady={stripeReady}
                checkoutAction={startProCheckout}
                portalAction={openBillingPortal}
              />
            </div>
          )}
        </section>

        {!isPro ? (
          <section className="rounded-2xl border border-[#0e1f1c]/12 bg-[linear-gradient(180deg,#ffffff_0%,#f6f8f7_100%)] p-6">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#1a5c51] uppercase">
              {PRO_PLAN_LABEL}
            </p>
            <p className="mt-2 font-display text-3xl font-medium tracking-[-0.04em] text-ink">
              {PRO_PLAN_PRICE}
            </p>
            <ul className="mt-5 space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex gap-2 text-[14px] text-ink-soft">
                  <span className="text-[#7eb8a4]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[12px] text-muted">
              Secure checkout via Stripe. Cancel anytime from the customer portal.
            </p>
          </section>
        ) : null}
      </div>
    </WorkspacePage>
  );
}
