import Link from "next/link";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import { HomePlanCard } from "@/components/marketing/home-plan-card";
import { SectionPlate } from "@/components/marketing/section-plate";
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
    <HomeSection>
      <div className="mx-auto max-w-6xl">
        <HomeEyebrow>Plans</HomeEyebrow>
        <div className="reveal-late mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          <h2 className="reveal max-w-[18ch] font-display text-chapter text-ink text-balance">
            The record is free. Pro is reach.
          </h2>
          {/* The badge-is-not-for-sale rule is stated verbatim in the lockup
              below. Saying it twice spent the section's most valuable line on
              a disclaimer instead of on what Pro actually does. */}
          <p className="max-w-[38ch] text-[15px] leading-relaxed text-muted lg:justify-self-end lg:pb-1 lg:text-right">
            Free keeps the record. Pro puts it in front of people — on your own
            site, in proposals, and through the API. Full comparison on{" "}
            <Link
              href="/pricing"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Pricing
            </Link>
            .
          </p>
        </div>

        {/* Both cards on one stage rather than loose on paper: the white Free
            card had a hairline but no ground to lift off, so the pair read as
            two rectangles instead of a priced choice. */}
        <SectionPlate tone="light" className="mt-11">
          <div className="grid gap-4 lg:grid-cols-2">
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
            emphasis="Most teams"
          />
        </div>

        {/* The section's whole argument, shown instead of stated: the mark
            spans both columns, so it visibly belongs to neither plan. It is
            the real `EmbedVerifiedLockup`, the same one a customer's site
            renders — not a picture of it. */}
          <div className="mt-4 flex flex-col items-start gap-5 rounded-card border border-line bg-surface px-6 py-6 sm:flex-row sm:items-center sm:gap-8 sm:px-8">
          <EmbedVerifiedLockup size="lg" />
          <div className="min-w-0">
            <p className="text-[15px] font-medium tracking-[-0.01em] text-ink">
              Included on both plans.
            </p>
            <p className="mt-1 max-w-lg text-[13.5px] leading-relaxed text-muted">
              The mark is domain proof and mutual confirmation. There is no
              price that buys it, and no plan that prints a tier beside it on
              your visitor&rsquo;s screen.
            </p>
          </div>
          <span
            className="hidden h-10 w-px shrink-0 bg-line sm:block"
            aria-hidden
          />
            <p className="shrink-0 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              Earned, not bought
            </p>
          </div>
        </SectionPlate>
      </div>
    </HomeSection>
  );
}
