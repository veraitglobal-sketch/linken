import type { Metadata } from "next";
import Link from "next/link";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { PricingCompare } from "@/components/pricing/pricing-compare";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import {
  BILLING_UNIT,
  PRICING_COMPARE,
  PRO_PLAN_PRICE,
} from "@/features/plan/pricing";
import { isStripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Hansala Free vs Pro — confirmed records stay free. Pro adds embeds, analytics, API, and team seats.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const stripeReady = isStripeConfigured();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
        Pricing
      </p>
      <h1 className="mt-4 max-w-2xl font-display text-[clamp(2rem,4.5vw,3.2rem)] font-medium leading-[1.08] tracking-[-0.042em] text-ink">
        The record is free. Pro is reach.
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        Confirmed partners, references, and projects stay on Free. {PRO_PLAN_PRICE}{" "}
        unlocks distribution — embeds, analytics, API, and team seats.{" "}
        {BILLING_UNIT}
      </p>

      <PricingCards stripeReady={stripeReady} />

      <section className="mt-16">
        <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-medium tracking-[-0.035em] text-ink">
          Compare plans
        </h2>
        <p className="mt-3 max-w-lg text-[14px] text-ink-soft">
          No hidden caps on confirmations. Limits below match product
          entitlements.
        </p>
        <PricingCompare rows={PRICING_COMPARE} />
      </section>

      <PricingFaq />

      <p className="mt-12 text-[13px] text-muted">
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
    </div>
  );
}
