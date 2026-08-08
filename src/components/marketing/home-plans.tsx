import Link from "next/link";
import { HomePlanCard } from "@/components/marketing/home-plan-card";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";
import {
  FREE_HIGHLIGHTS,
  FREE_PLAN_PRICE,
  PRO_HIGHLIGHTS,
  PRO_PLAN_LABEL,
  PRO_PLAN_PRICE,
} from "@/features/plan/pricing";

/** Homepage §7 — Free vs Pro; same source as /pricing. Badge is never sold. */
export function HomePlans() {
  return (
    <HomeSection tone="tight" className="!pb-16 sm:!pb-20">
      <div className="mx-auto max-w-6xl">
        <HomeEyebrow>Plans</HomeEyebrow>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          <h2 className="max-w-[18ch] font-display text-chapter text-ink text-balance">
            The record is free. Pro is reach.
          </h2>
          <p className="max-w-[38ch] text-[15px] leading-relaxed text-muted lg:justify-self-end lg:pb-1 lg:text-right">
            Verification is never for sale — the badge is domain proof, not a
            paid tier. Full comparison on{" "}
            <Link
              href="/pricing"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Pricing
            </Link>
            .
          </p>
        </div>

        <div className="mt-11 grid gap-4 lg:grid-cols-2">
          <HomePlanCard
            name="Free"
            price={FREE_PLAN_PRICE}
            note="Confirmed records stay free. The badge is earned, not bought."
            features={FREE_HIGHLIGHTS}
            cta="Create your free profile"
            href="/onboarding"
          />
          <HomePlanCard
            name={PRO_PLAN_LABEL}
            price={PRO_PLAN_PRICE}
            note="Everything in Free, plus distribution and team seats."
            features={PRO_HIGHLIGHTS}
            cta="See pricing"
            href="/pricing"
            dark
          />
        </div>
      </div>
    </HomeSection>
  );
}
