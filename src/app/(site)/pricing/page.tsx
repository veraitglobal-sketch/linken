import type { Metadata } from "next";
import Link from "next/link";
import { PageViewBeacon } from "@/components/analytics/page-view-beacon";
import { HomePill } from "@/components/marketing/home-section";
import { PricingAddons, type Addon } from "@/components/pricing/pricing-addons";
import { PricingCompare } from "@/components/pricing/pricing-compare";
import { PricingPhotoBand } from "@/components/pricing/pricing-photo-band";
import { PricingFaqSplit } from "@/components/pricing/pricing-faq-split";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import {
  BILLING_UNIT,
  FREE_HIGHLIGHTS,
  FREE_PLAN_PRICE,
  PRICING_COMPARE,
  PRO_HIGHLIGHTS,
  PRO_PLAN_LABEL,
  PRO_PLAN_PRICE,
  proCta,
} from "@/features/plan/pricing";
import { pricingFaq } from "@/features/plan/pricing-faq";
import { isStripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Hansala Free vs Pro — confirmed records stay free. Pro adds embeds, analytics, API, and team seats.",
  alternates: { canonical: "/pricing" },
};

function Icon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** What Pro adds — every line is an entitlement in PRICING_COMPARE / PRO_HIGHLIGHTS. */
const ADDONS: readonly Addon[] = [
  {
    title: "Website widgets",
    body: "Testimonials and partner logos on your own site.",
    features: [
      "Testimonials widget, all layouts",
      "Partner logo wall, rotate and footer strip",
      "Widget studio — layout, theme and placements",
      "New confirmed partners appear without touching code",
    ],
    href: "/dashboard/widgets",
    cta: "Open widgets",
    icon: <Icon d="M4 5h16v14H4zM4 9h16M8 13h4M8 16h8" />,
  },
  {
    title: "Analytics",
    body: "Who looks at your profile, and where they came from.",
    features: ["Full profile analytics", "Visits and inquiries over time"],
    href: "/dashboard/insights",
    cta: "Open insights",
    icon: <Icon d="M4 20V10m5 10V4m5 16v-7m5 7V8" />,
  },
  {
    title: "Agent API & webhooks",
    body: "Drive the same record from your own tools.",
    features: ["Agent API keys", "Webhooks on record changes", "Public API stays open on every plan"],
    href: "/developers",
    cta: "Read the docs",
    icon: <Icon d="M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5" />,
  },
  {
    title: "Team & proposals",
    body: "More seats, and a one-pager with your branding.",
    features: ["Additional team seats", "Branded one-pager for proposals"],
    href: "/dashboard/team",
    cta: "Open team",
    icon: <Icon d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 8v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M17 11a3 3 0 1 0 0-6" />,
  },
];

export default function PricingPage() {
  const stripeReady = isStripeConfigured();
  const pro = proCta(stripeReady);

  return (
    <div className="bg-wash">
      <PageViewBeacon event="pricing_viewed" page="/pricing" />

      <section className="px-4 pt-16 pb-10 text-center sm:px-[18px] sm:pt-24">
        <h1 className="mx-auto max-w-3xl font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.04] font-semibold tracking-[-0.045em] text-ink text-balance">
          The record is free. Pro is reach.
        </h1>
        <p className="mx-auto mt-6 max-w-[56ch] text-[18px] leading-relaxed text-ink-soft">
          Confirmed partners, references and projects stay free. Pay only when
          you want them working on your own site, in proposals and through the
          API.
        </p>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 sm:px-[18px]">
        <PricingPlans
          billingUnit={BILLING_UNIT}
          free={{
            id: "free",
            name: "Free",
            tagline: "Keep the record",
            price: FREE_PLAN_PRICE,
            note: "The record stays free. Verification is never for sale.",
            highlights: FREE_HIGHLIGHTS,
            cta: { href: "/onboarding", label: "Create your free profile" },
          }}
          pro={{
            id: "pro",
            name: PRO_PLAN_LABEL,
            tagline: "Put it in front of people",
            price: PRO_PLAN_PRICE,
            note: stripeReady
              ? "Everything in Free, plus distribution. Upgrade anytime from Workspace → Billing."
              : "Everything in Free, plus distribution. Checkout is not live yet — contact us to join Pro.",
            highlights: PRO_HIGHLIGHTS,
            cta: pro,
          }}
        />
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pt-24 sm:px-[18px]">
        <div className="text-center">
          <h2 className="font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-ink">
            What Pro adds
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[17px] text-ink-soft">
            The record on Hansala stays the same on both plans. Pro is where it
            goes next.
          </p>
        </div>
        <div className="mt-12">
          <PricingAddons items={ADDONS} />
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pt-24 sm:px-[18px]">
        <div className="text-center">
          <h2 className="font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-ink">
            Compare plans
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[17px] text-ink-soft">
            No caps on confirmations. Limits below match what the product
            enforces.
          </p>
        </div>
        <div className="mt-12">
          <PricingCompare rows={PRICING_COMPARE} />
        </div>
      </section>

      <PricingPhotoBand
        title="One record, whichever plan you are on"
        src="/images/lookup-wide-a1.jpg"
        alt="A small team in conversation around a table in a workshop"
        lead="See what a buyer sees on a confirmed company profile before you choose."
        href="/demo"
        cta="See a live example"
      />

      {/* The rule that makes the price honest — navy chapter, one sentence. */}
      <section className="px-4 pt-24 sm:px-[18px]">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-6 rounded-[32px] bg-navy px-6 py-14 text-center text-on-navy sm:rounded-[48px] sm:py-20">
          <span className="inline-flex h-9 items-center gap-2 rounded-full bg-lime px-4 text-[13px] font-semibold text-navy">
            Earned, not bought
          </span>
          <h2 className="max-w-[22ch] font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-balance">
            No price buys the verification mark.
          </h2>
          <p className="max-w-[56ch] text-[17px] leading-relaxed text-on-navy-soft">
            The mark means domain proof and mutual confirmation. It is the same
            on both plans, and no plan prints a tier beside it on your
            visitor&rsquo;s screen.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pt-24 sm:px-[18px]">
        <h2 className="text-center font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-ink">
          FAQ
        </h2>
        <div className="mt-12">
          <PricingFaqSplit items={pricingFaq(stripeReady)} />
        </div>
      </section>

      <section className="px-4 pt-24 pb-24 text-center sm:px-[18px] sm:pb-32">
        <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-ink text-balance">
          Start with the record. Add reach when it pays.
        </h2>
        <p className="mx-auto mt-5 max-w-[52ch] text-[17px] text-ink-soft">
          Create your company profile on the Free plan and upgrade only if you need to.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <HomePill href="/onboarding">Create your free profile</HomePill>
          <HomePill href={pro.href} tone="outline">
            {stripeReady ? "Upgrade to Pro" : "Contact us about Pro"}
          </HomePill>
        </div>
        <p className="mt-10 text-[13px] text-muted">
          Legal entity and terms:{" "}
          <Link href="/company" className="font-medium text-ink underline-offset-2 hover:underline">
            company information
          </Link>
          ,{" "}
          <Link href="/terms" className="font-medium text-ink underline-offset-2 hover:underline">
            terms
          </Link>
          ,{" "}
          <Link href="/contact" className="font-medium text-ink underline-offset-2 hover:underline">
            contact
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
