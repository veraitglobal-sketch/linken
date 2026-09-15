import type { Metadata } from "next";
import { HomeBento } from "@/components/marketing/home-bento";
import { HomeClose } from "@/components/marketing/home-close";
import { FAQ_ITEMS, HomeFaq } from "@/components/marketing/home-faq";
import { HomeFreeBanner } from "@/components/marketing/home-free-banner";
import { HomeFreeChapter } from "@/components/marketing/home-free-chapter";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeMoments } from "@/components/marketing/home-moments";
import { HomeRecordTrust } from "@/components/marketing/home-record-trust";
import { HomeRuleChapter } from "@/components/marketing/home-rule-chapter";
import { HomeSectors } from "@/components/marketing/home-sectors";
import { HomeSurfaces } from "@/components/marketing/home-surfaces";
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
    siteName: "Hansala",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Hansala — mutual confirmation" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
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
      <HomeRuleChapter />
      <HomeSectors />
      <HomeSurfaces />
      <HomeFreeBanner />
      <HomeMoments />
      <HomeFreeChapter />
      <HomeBento />
      <HomeRecordTrust />
      <HomeFaq />
      <HomeClose />
    </>
  );
}
