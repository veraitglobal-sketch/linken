import type { Metadata } from "next";
import { HomeClose } from "@/components/marketing/home-close";
import { HomeContrast } from "@/components/marketing/home-contrast";
import { FAQ_ITEMS, HomeFaq } from "@/components/marketing/home-faq";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeHighlights } from "@/components/marketing/home-highlights";
import { HomeIconLine } from "@/components/marketing/home-icon-line";
import { HomeOverview } from "@/components/marketing/home-overview";
import { HomeStories } from "@/components/marketing/home-stories";
import { HomeProductFlow } from "@/components/marketing/product-flow";
import { HomeTalks } from "@/components/marketing/home-talks";

export const revalidate = 3600;

/** Set here, not in the root layout — child pages without their own would inherit it. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeHero />
      <HomeIconLine />
      <HomeOverview />
      <HomeProductFlow />
      <HomeContrast />
      <HomeStories />
      <HomeTalks />
      <HomeHighlights />
      <HomeFaq />
      <HomeClose />
    </>
  );
}
