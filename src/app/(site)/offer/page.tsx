import type { Metadata } from "next";
import { PageViewBeacon } from "@/components/analytics/page-view-beacon";
import { HomeSection } from "@/components/marketing/home-section";
import { OfferCards } from "@/components/offer/offer-cards";
import { OfferFlash } from "@/components/offer/offer-flash";
import { OfferHero } from "@/components/offer/offer-hero";
import { OfferPlate } from "@/components/offer/offer-plate";
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
    <>
      <PageViewBeacon event="pricing_viewed" page="/offer" />
      <HomeSection tone="mute" className="!pt-12 sm:!pt-16 !pb-16 sm:!pb-20">
        <div className="mx-auto max-w-6xl">
          <OfferFlash success={success} canceled={canceled} error={error} />
          <OfferHero />
          <OfferCards ready={ready} />
          <p className="mt-6 max-w-[70ch] text-[13.5px] leading-relaxed text-muted">
            The Verified mark is never sold. Subscriptions renew at this price
            until you cancel from Workspace → Billing.
          </p>
        </div>
      </HomeSection>
      <HomeSection className="!py-16 sm:!py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start lg:gap-16">
          <PricingFaq items={OFFER_FAQ} title="Questions" className="mt-0" />
          <OfferPlate />
        </div>
      </HomeSection>
    </>
  );
}
