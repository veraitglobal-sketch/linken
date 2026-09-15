import Link from "next/link";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import { HomePlanCard } from "@/components/marketing/home-plan-card";
import {
  Accent,
  HomeHeading,
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
    <HomeSection className="!py-14 sm:!py-16">
      <div className="mx-auto max-w-5xl">
        <HomeHeading
          eyebrow="Plans"
          title={
            <>
              The record is free. <Accent>Pro is reach.</Accent>
            </>
          }
          lead={
            <>
              Free keeps the record. Pro puts it in front of people — on your
              own site, in proposals, and through the API. Full comparison on{" "}
              <Link
                href="/pricing"
                className="font-semibold text-ink underline-offset-2 hover:underline"
              >
                Pricing
              </Link>
              .
            </>
          }
        />

        {/* The mark leads, as a chip under the heading: the one sentence no
            competitor selling a badge can print. The real lockup. */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-4 rounded-full bg-surface py-2 pr-6 pl-3 ring-1 ring-line">
            <EmbedVerifiedLockup size="md" />
            <span className="h-7 w-px shrink-0 bg-line" aria-hidden />
            <p className="text-[13px] leading-snug text-ink-soft">
              <span className="font-semibold text-ink">Earned, not bought.</span>{" "}
              No price buys the mark.
            </p>
          </div>
        </div>

        {/* Pro sits on a tinted plate — Thrivea's highlighted plan — so the
            navy card has a ground of its own instead of floating on the page. */}
        <div className="grad-mint mt-10 grid items-stretch gap-4 rounded-hero p-3 sm:p-5 lg:grid-cols-2">
          <HomePlanCard
            name="Free"
            price={FREE_PLAN_PRICE}
            note="Confirmed records stay free. The badge is earned, not bought."
            features={FREE_HIGHLIGHTS}
            cta="Create your free profile"
            href="/onboarding"
            bridge="Distribution — embeds, analytics and the API — is what Pro adds."
          />
          <HomePlanCard
            name={PRO_PLAN_LABEL}
            price={PRO_PLAN_PRICE}
            note="Everything in Free, plus testimonials and partner logos on your site."
            features={PRO_HIGHLIGHTS}
            cta="Start with Pro"
            href="/onboarding?plan=pro"
            dark
            emphasis="Most teams"
          />
        </div>

        <p className="mx-auto mt-6 max-w-[64ch] text-center text-[13.5px] leading-relaxed text-ink-soft">
          The mark is domain proof and mutual confirmation. There is no price
          that buys it, and no plan that prints a tier beside it on your
          visitor&rsquo;s screen.
        </p>
      </div>
    </HomeSection>
  );
}
