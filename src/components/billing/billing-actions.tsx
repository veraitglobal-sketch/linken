"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Props = {
  isPro: boolean;
  hasSubscription: boolean;
  stripeReady: boolean;
  checkoutAction: () => void;
  portalAction: () => void;
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
  stripeReady,
  checkoutAction,
  portalAction,
}: Props) {
  if (!stripeReady) {
    return (
      <p className="text-[13px] leading-relaxed text-muted">
        Stripe is not configured yet. Add{" "}
        <code className="rounded bg-paper px-1 py-0.5 text-[12px]">STRIPE_SECRET_KEY</code>,{" "}
        <code className="rounded bg-paper px-1 py-0.5 text-[12px]">STRIPE_PRICE_PRO_MONTHLY</code>, and{" "}
        <code className="rounded bg-paper px-1 py-0.5 text-[12px]">STRIPE_WEBHOOK_SECRET</code>{" "}
        to enable checkout.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {!isPro ? (
        <form action={checkoutAction}>
          <SubmitButton label="Upgrade to Pro" variant="primary" />
        </form>
      ) : null}
      {hasSubscription ? (
        <form action={portalAction}>
          <SubmitButton label="Manage subscription" variant="secondary" />
        </form>
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
