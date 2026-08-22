import Link from "next/link";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
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
    <HomeSection tone="mute">
      <div className="mx-auto max-w-6xl">
        {/* The mark leads. Every competitor sells a badge; the one sentence
            none of them can print was sitting at the foot of this section as a
            grey footnote. It opens the section instead, and the eyebrow /
            heading / right-paragraph block every other section uses goes with
            it. The lockup is the real `EmbedVerifiedLockup` — the same one a
            customer's site renders. */}
        <div className="reveal-late grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          <div>
            <HomeEyebrow>Plans</HomeEyebrow>
            <h2 className="reveal mt-5 max-w-[18ch] font-display text-chapter text-ink text-balance">
              The record is free. Pro is reach.
            </h2>
            <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-muted">
              Free keeps the record. Pro puts it in front of people — on your
              own site, in proposals, and through the API. Full comparison on{" "}
              <Link
                href="/pricing"
                className="font-semibold text-ink underline-offset-2 hover:underline"
              >
                Pricing
              </Link>
              .
            </p>
          </div>

          <div className="lg:justify-self-end">
            {/* White on the band, not ink over it.
                This was `bg-ink/[0.028]` — a tint designed to read as a
                panel against white paper. The section is now a `--mute`
                band, so the tint stacked on top of it and composited to
                `rgb(233,235,233)`, which dropped `--muted` inside from
                5.13:1 to 4.28:1 — under AA. A plain white card is the right
                figure on a grey band anyway, and it puts the type back on
                paper. */}
            <div className="flex items-center gap-5 rounded-card border border-line bg-surface px-6 py-5">
              <EmbedVerifiedLockup size="lg" />
              <span className="h-11 w-px shrink-0 bg-line" aria-hidden />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                  Earned, not bought
                </p>
                <p className="mt-1.5 max-w-[26ch] text-[13px] leading-relaxed text-muted">
                  On both plans. No price buys the mark.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* No plate. `--mute` is #ffffff, so the light stage rendered white on
            white — measured — and contributed padding and nothing else. The
            weight comes from the cards themselves instead. */}
        <div className="mt-11 grid items-stretch gap-4 lg:grid-cols-[1fr_1.06fr]">
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
            note="Everything in Free, plus distribution and team seats."
            features={PRO_HIGHLIGHTS}
            cta="Start with Pro"
            href="/onboarding?plan=pro"
            dark
            emphasis="Most teams"
          />
        </div>

        {/* One line, not a slab. The lockup and "Earned, not bought" now open
            the section; repeating the whole argument underneath the prices
            said it twice and ended the section on grey. */}
        <p className="mt-6 max-w-[70ch] text-[13.5px] leading-relaxed text-muted">
          The mark is domain proof and mutual confirmation. There is no price
          that buys it, and no plan that prints a tier beside it on your
          visitor&rsquo;s screen.
        </p>
      </div>
    </HomeSection>
  );
}
