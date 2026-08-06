import { Button } from "@/components/ui/button";
import {
  FREE_HIGHLIGHTS,
  FREE_PLAN_PRICE,
  PRO_HIGHLIGHTS,
  PRO_PLAN_LABEL,
  PRO_PLAN_PRICE,
  proCta,
} from "@/features/plan/pricing";

type Props = { stripeReady: boolean };

export function PricingCards({ stripeReady }: Props) {
  const pro = proCta(stripeReady);

  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-2">
      <article className="flex flex-col rounded-[24px] border border-line bg-surface p-7 sm:p-9">
        <h2 className="font-display text-[22px] font-medium tracking-[-0.025em] text-ink">
          Free
        </h2>
        <p className="mt-2 font-display text-[28px] font-medium tracking-[-0.03em] text-ink">
          {FREE_PLAN_PRICE}
        </p>
        <p className="mt-2 text-[13px] text-muted">
          The record stays free. Verification is never for sale.
        </p>
        <ul className="mt-6 flex-1 space-y-3">
          {FREE_HIGHLIGHTS.map((f) => (
            <li
              key={f}
              className="flex gap-3 text-[13.5px] leading-relaxed text-ink-soft"
            >
              <span
                className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#7eb8a4]"
                aria-hidden
              />
              {f}
            </li>
          ))}
        </ul>
        <Button
          href="/onboarding"
          variant="secondary"
          className="mt-8 h-11 w-full sm:w-auto sm:min-w-[220px]"
        >
          Create your free profile
        </Button>
      </article>

      <article className="flex flex-col rounded-[24px] bg-navy p-7 text-white shadow-[0_24px_60px_rgba(8,20,18,0.2)] sm:p-9">
        <h2 className="font-display text-[22px] font-medium tracking-[-0.025em]">
          {PRO_PLAN_LABEL}
        </h2>
        <p className="mt-2 font-display text-[28px] font-medium tracking-[-0.03em]">
          {PRO_PLAN_PRICE}
        </p>
        <p className="mt-2 text-[13px] text-white/55">
          Everything in Free, plus distribution and team seats.
          {!stripeReady
            ? " Checkout is not live yet — contact us to join Pro."
            : " Upgrade anytime from Workspace → Billing."}
        </p>
        <ul className="mt-6 flex-1 space-y-3">
          {PRO_HIGHLIGHTS.map((f) => (
            <li
              key={f}
              className="flex gap-3 text-[13.5px] leading-relaxed text-white/75"
            >
              <span
                className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#7eb8a4]"
                aria-hidden
              />
              {f}
            </li>
          ))}
        </ul>
        <Button
          href={pro.href}
          variant="light"
          className="mt-8 h-11 w-full sm:w-auto sm:min-w-[220px]"
        >
          {pro.label}
        </Button>
      </article>
    </div>
  );
}
