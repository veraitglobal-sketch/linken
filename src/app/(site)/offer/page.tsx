import type { Metadata } from "next";
import Image from "next/image";
import { PageViewBeacon } from "@/components/analytics/page-view-beacon";
import { HomeSection } from "@/components/marketing/home-section";
import { OfferCards } from "@/components/offer/offer-cards";
import { OfferFlash } from "@/components/offer/offer-flash";
import { OfferHero } from "@/components/offer/offer-hero";
import { OfferPlate } from "@/components/offer/offer-plate";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import { isOfferCheckoutReady } from "@/features/billing/config";
import { fulfillOfferSession } from "@/features/billing/offer-fulfill";
import { OFFER_ASSURANCES, OFFER_FAQ } from "@/features/billing/offer";

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
      <HomeSection tone="mute" className="!pt-4 sm:!pt-6 !pb-16 sm:!pb-20">
        <div className="mx-auto max-w-6xl">
          <OfferFlash success={success} canceled={canceled} error={error} />
          <div className="relative mt-2 overflow-hidden rounded-hero bg-navy shadow-hero">
            <Image
              src="/images/offer-studio.webp"
              alt=""
              fill
              priority
              quality={75}
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover object-[68%_50%]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-navy-deep/55 lg:bg-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,20,18,0.86)_0%,rgba(8,20,18,0.6)_38%,rgba(8,20,18,0.1)_68%,rgba(8,20,18,0)_100%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(8,20,18,0.55),rgba(8,20,18,0))]"
              aria-hidden
            />
            <div className="relative px-7 pt-12 pb-36 sm:px-12 sm:pt-14 sm:pb-48 lg:pb-52">
              <OfferHero />
            </div>
          </div>
          <OfferCards
            ready={ready}
            className="relative -mt-28 px-3 sm:-mt-36 sm:px-6 lg:-mt-44 lg:px-10"
          />
          <ul className="mt-10 flex list-none flex-wrap items-center gap-x-7 gap-y-3 border-t border-line p-0 pt-6 text-[13.5px] text-ink-soft">
            {OFFER_ASSURANCES.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="h-1 w-1 rounded-full bg-muted" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
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
