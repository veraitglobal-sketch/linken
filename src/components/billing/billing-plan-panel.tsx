import { BillingActions, PlanBadge } from "@/components/billing/billing-actions";
import type { CompanyPlan } from "@/features/plan/entitlements";

type Props = {
  companyName: string;
  plan: CompanyPlan;
  isPro: boolean;
  isOwner: boolean;
  stripeReady: boolean;
  hasSubscription: boolean;
  cancelAtPeriodEnd: boolean;
  renewLabel?: string | null;
  checkoutAction: () => void;
  portalAction: () => void;
  cancelAction: () => void;
  resumeAction: () => void;
  endManualAction: () => void;
};

export function BillingPlanPanel({
  companyName,
  plan,
  isPro,
  isOwner,
  stripeReady,
  hasSubscription,
  cancelAtPeriodEnd,
  renewLabel,
  checkoutAction,
  portalAction,
  cancelAction,
  resumeAction,
  endManualAction,
}: Props) {
  return (
    <section className="flex h-full flex-col justify-between rounded-[28px] border border-line bg-surface px-7 py-8 lg:rounded-[32px] lg:px-9 lg:py-10">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
          Current plan
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-[1.65rem] font-medium tracking-[-0.03em] text-ink">
            {companyName}
          </h2>
          <PlanBadge plan={plan} />
        </div>
        {renewLabel ? (
          <p className="mt-2 text-[13px] text-muted">{renewLabel}</p>
        ) : (
          <p className="mt-2 text-[13px] text-muted">
            {isPro
              ? "Pro tools are active for this company."
              : "Free includes profile, confirmations, and basic embeds. Upgrade for premium embeds, analytics, Agent API, and team seats."}
          </p>
        )}
      </div>

      <div className="mt-10">
        {!isOwner ? (
          <p className="text-[13px] text-muted">
            Ask your company owner to upgrade or manage billing.
          </p>
        ) : (
          <BillingActions
            isPro={isPro}
            hasSubscription={hasSubscription}
            cancelAtPeriodEnd={cancelAtPeriodEnd}
            stripeReady={stripeReady}
            checkoutAction={checkoutAction}
            portalAction={portalAction}
            cancelAction={cancelAction}
            resumeAction={resumeAction}
            endManualAction={endManualAction}
          />
        )}
      </div>
    </section>
  );
}
