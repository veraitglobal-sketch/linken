import type { Metadata } from "next";
import { HomeAssurance } from "@/components/marketing/home-assurance";
import { HomeClose } from "@/components/marketing/home-close";
import { HomeContrast } from "@/components/marketing/home-contrast";
import { FAQ_ITEMS, HomeFaq } from "@/components/marketing/home-faq";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeHighlights } from "@/components/marketing/home-highlights";
import { HomeOutcomes } from "@/components/marketing/home-outcomes";
import { HomeOverview } from "@/components/marketing/home-overview";
import { HomePlans } from "@/components/marketing/home-plans";
import { HomeStories } from "@/components/marketing/home-stories";
import { HomeProductFlow } from "@/components/marketing/product-flow";
import { HomeTalks } from "@/components/marketing/home-talks";
import { PageViewBeacon } from "@/components/analytics/page-view-beacon";

export const revalidate = 3600;

const homeTitle = "Hansala — Turn your past work into verified proof";
const homeDescription =
  "Invite clients and partners to confirm your projects. Use verified references on your company profile, website, and proposals — public only after both sides confirm.";

/** Set here, not in the root layout — child pages without their own would inherit it. */
export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: "/",
  },
  twitter: {
    title: homeTitle,
    description: homeDescription,
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function HomePage() {
  return (
    <>
      <PageViewBeacon event="landing_page_viewed" page="/" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeHero />
      <HomeOverview />
      <HomeProductFlow />
      <HomeOutcomes />
      <HomeContrast />
      <HomeStories />
      <HomeTalks />
      <HomeHighlights />
      <HomePlans />
      <HomeAssurance />
      <HomeFaq />
      <HomeClose />
    </>
  );
}
