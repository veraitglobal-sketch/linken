import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageViewBeacon } from "@/components/analytics/page-view-beacon";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import { OfferCards } from "@/components/offer/offer-cards";
import { OfferFlash } from "@/components/offer/offer-flash";
import { PricingPhotoBand } from "@/components/pricing/pricing-photo-band";
import { PricingFaqSplit } from "@/components/pricing/pricing-faq-split";
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

const ASSURANCE_ICONS = [
  "M7.5 11V8a4.5 4.5 0 0 1 9 0v3M5.5 11h13v9.5h-13z",
  "M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4",
  "M5 12.5l4.5 4.5L19 7.5",
];

export default async function OfferPage({ searchParams }: Props) {
  const { success, canceled, error, session_id } = await searchParams;
  if (success && session_id) {
    await fulfillOfferSession(session_id).catch(() => undefined);
  }
  const ready = isOfferCheckoutReady();

  return (
    <div className="bg-wash">
      <PageViewBeacon event="pricing_viewed" page="/offer" />

      <section className="px-4 pt-14 text-center sm:px-[18px] sm:pt-20">
        <div className="mx-auto max-w-[1180px]">
          <OfferFlash success={success} canceled={canceled} error={error} />
        </div>
        <p className="mt-6 inline-flex h-9 items-center gap-2 rounded-full bg-lime px-4 text-[13px] font-semibold text-navy">
          <span className="size-1.5 rounded-full bg-navy" />
          Special introductory offer
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.04] font-semibold tracking-[-0.045em] text-ink text-balance">
          Your work already speaks for you.
        </h1>
        <p className="mx-auto mt-6 max-w-[54ch] text-[18px] leading-relaxed text-ink-soft">
          Pro puts your confirmed partners and their words on your own site.
          Same Pro as monthly, billed in USD.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex h-12 items-baseline gap-2 rounded-full bg-surface px-6 pt-2.5 ring-1 ring-line">
            <span className="text-[14px] text-muted">From</span>
            <span className="font-display text-[26px] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">
              $12.42
            </span>
            <span className="text-[14px] text-muted">/ month</span>
          </span>
          <Link
            href="/pricing"
            className="inline-flex h-12 items-center rounded-full px-5 text-[15px] font-semibold text-ink underline-offset-4 hover:underline"
          >
            See standard pricing
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pt-12 sm:px-[18px]">
        <OfferCards ready={ready} className="lg:grid-cols-2" />

        <ul className="mt-6 grid list-none gap-3 p-0 sm:grid-cols-3">
          {OFFER_ASSURANCES.map((item, i) => (
            <li
              key={item}
              className="flex items-center gap-3 rounded-2xl bg-surface px-5 py-4 text-[15px] font-medium text-ink ring-1 ring-line/80"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-lime-soft text-navy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d={ASSURANCE_ICONS[i] ?? ASSURANCE_ICONS[2]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <PricingPhotoBand
        title="Put the work you have done in front of the next client"
        src="/images/lookup-wide-b1.jpg"
        alt="Two people going through a notebook together at a table"
        lead="Testimonials and partner logos on your own site, confirmed by the companies behind them."
        href="/demo"
        cta="See a live example"
      />

      {/* The mark, embossed — "earned, not bought" as a navy chapter. */}
      <section className="px-4 pt-24 sm:px-[18px]">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 overflow-hidden rounded-[32px] bg-navy p-4 text-on-navy sm:rounded-[48px] sm:p-6 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[24px] sm:rounded-[36px]">
            <Image
              src="/images/offer-emboss.webp"
              alt="The Hansala mark blind-embossed on a sheet of cotton paper"
              fill
              quality={75}
              loading="lazy"
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          </div>
          <div className="px-3 pb-8 sm:px-6 lg:px-4 lg:pb-0">
            <span className="inline-flex h-9 items-center rounded-full bg-lime px-4 text-[13px] font-semibold text-navy">
              Earned, not bought
            </span>
            <h2 className="mt-6 max-w-[18ch] font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-balance">
              The Verified mark is never sold.
            </h2>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-on-navy-soft">
              This offer is Pro — widgets, analytics, API and team seats. The
              mark means domain proof and mutual confirmation, and it is the
              same on every plan.
            </p>
            <div className="mt-8 inline-flex rounded-2xl bg-white px-5 py-4">
              <EmbedVerifiedLockup size="lg" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pt-24 pb-24 sm:px-[18px] sm:pb-32">
        <h2 className="text-center font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-ink">
          Questions
        </h2>
        <div className="mt-12">
          <PricingFaqSplit items={OFFER_FAQ} />
        </div>
      </section>
    </div>
  );
}
