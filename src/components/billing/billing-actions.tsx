"use client";

import { useFormStatus } from "react-dom";
import { CancelSubscriptionForm } from "@/components/billing/cancel-subscription-form";
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
};

function SubmitButton({
  label,
  variant,
  disabled,
}: {
  label: string;
  variant: "primary" | "secondary";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant === "primary" ? "primary" : "secondary"}
      className="h-11 px-5"
      disabled={disabled || pending}
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
}: Props) {
  if (!stripeReady) {
    return (
      <p className="text-[13px] leading-relaxed text-muted">
        Stripe is not configured yet. Add{" "}
        <code className="rounded bg-paper px-1 py-0.5 text-[12px]">
          STRIPE_SECRET_KEY
        </code>
        ,{" "}
        <code className="rounded bg-paper px-1 py-0.5 text-[12px]">
          STRIPE_PRICE_PRO_MONTHLY
        </code>
        , and{" "}
        <code className="rounded bg-paper px-1 py-0.5 text-[12px]">
          STRIPE_WEBHOOK_SECRET
        </code>{" "}
        to enable checkout.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {!isPro ? (
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
          <CancelSubscriptionForm action={cancelAction} />
        ) : null}
        {hasSubscription && cancelAtPeriodEnd ? (
          <form action={resumeAction}>
            <SubmitButton label="Keep Pro" variant="primary" />
          </form>
        ) : null}
      </div>
      {hasSubscription && !cancelAtPeriodEnd ? (
        <p className="text-[12px] leading-relaxed text-muted">
          Cancel anytime. You keep Pro until the end of the current period.
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
