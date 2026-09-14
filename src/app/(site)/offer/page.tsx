import type { Metadata } from "next";
import Link from "next/link";
import { PageViewBeacon } from "@/components/analytics/page-view-beacon";
import { OfferCards } from "@/components/offer/offer-cards";
import { OfferFlash } from "@/components/offer/offer-flash";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import { isOfferCheckoutReady } from "@/features/billing/config";
import { fulfillOfferSession } from "@/features/billing/offer-fulfill";
import { OFFER_FAQ } from "@/features/billing/offer";

export const metadata: Metadata = {
  title: "Introductory Pro",
  description:
    "Hansala Pro in US dollars — $99 for six months or $149 for a year. Same Pro entitlements as monthly.",
  alternates: { canonical: "/offer" },
};

type Props = {
  searchParams: Promise<{
    success?: string;
    canceled?: string;
    error?: string;
    session_id?: string;
  }>;
};

export default async function OfferPage({ searchParams }: Props) {
  const { success, canceled, error, session_id } = await searchParams;
  if (success && session_id) {
    await fulfillOfferSession(session_id).catch(() => undefined);
  }
  const ready = isOfferCheckoutReady();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PageViewBeacon event="pricing_viewed" page="/offer" />
      <p className="text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
        Introductory offer
      </p>
      <h1 className="mt-4 max-w-2xl font-display text-[clamp(2rem,4.5vw,3.2rem)] font-medium leading-[1.08] tracking-[-0.042em] text-ink">
        Pro in US dollars.
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        Six months for $99, or one year for $149. Same Pro as monthly — testimonials
        and partner logos on your site, analytics, API, and team seats.{" "}
        <Link href="/pricing" className="font-medium text-ink underline-offset-2 hover:underline">
          Standard monthly pricing
        </Link>{" "}
        is €79.
      </p>
      <OfferFlash success={success} canceled={canceled} error={error} />
      <OfferCards ready={ready} />
      <PricingFaq items={OFFER_FAQ} />
    </div>
  );
}