"use client";

import { useFormStatus } from "react-dom";
import { ConfirmBillingForm } from "@/components/billing/confirm-billing-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Props = {
  isPro: boolean;
  hasSubscription: boolean;
  cancelAtPeriodEnd: boolean;
  stripeReady: boolean;
  checkoutAction: () => void;
  portalAction: () => void;
  cancelAction: () => void;
  resumeAction: () => void;
  endManualAction: () => void;
};

function SubmitButton({
  label,
  variant,
}: {
  label: string;
  variant: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant === "primary" ? "primary" : "secondary"}
      className="h-11 px-5"
      disabled={pending}
    >
      {pending ? "Redirecting…" : label}
    </Button>
  );
}

export function BillingActions({
  isPro,
  hasSubscription,
  cancelAtPeriodEnd,
  stripeReady,
  checkoutAction,
  portalAction,
  cancelAction,
  resumeAction,
  endManualAction,
}: Props) {
  const manualPro = isPro && !hasSubscription;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {!isPro && stripeReady ? (
          <form action={checkoutAction}>
            <SubmitButton label="Upgrade to Pro" variant="primary" />
          </form>
        ) : null}
        {hasSubscription ? (
          <form action={portalAction}>
            <SubmitButton label="Payment & invoices" variant="secondary" />
          </form>
        ) : null}
        {hasSubscription && !cancelAtPeriodEnd ? (
          <ConfirmBillingForm
            action={cancelAction}
            label="Cancel subscription"
            pendingLabel="Canceling…"
            confirm="Cancel Pro at the end of this billing period? You keep access until then."
          />
        ) : null}
        {hasSubscription && cancelAtPeriodEnd ? (
          <form action={resumeAction}>
            <SubmitButton label="Keep Pro" variant="primary" />
          </form>
        ) : null}
        {manualPro ? (
          <ConfirmBillingForm
            action={endManualAction}
            label="Remove Pro"
            pendingLabel="Removing…"
            confirm="Remove Pro from this company now? Premium embeds, analytics, Agent API, and team seats will lock immediately."
          />
        ) : null}
      </div>
      {hasSubscription && !cancelAtPeriodEnd ? (
        <p className="text-[12px] leading-relaxed text-muted">
          Cancel anytime. You keep Pro until the end of the current period.
        </p>
      ) : null}
      {manualPro ? (
        <p className="text-[12px] leading-relaxed text-muted">
          Pro was granted without a Stripe subscription. Remove it here, or
          upgrade via checkout for billed cancel-anytime access.
        </p>
      ) : null}
      {!stripeReady && !isPro ? (
        <p className="text-[13px] leading-relaxed text-muted">
          Stripe is not configured yet on this environment.
        </p>
      ) : null}
    </div>
  );
}

export function PlanBadge({
  plan,
  className,
}: {
  plan: "free" | "pro" | "founding";
  className?: string;
}) {
  const label =
    plan === "founding" ? "Founding" : plan === "pro" ? "Pro" : "Free";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase",
        plan === "pro" || plan === "founding"
          ? "bg-[#0e1f1c] text-[#7eb8a4]"
          : "border border-line bg-paper text-muted",
        className,
      )}
    >
      {label}
    </span>
  );
}
