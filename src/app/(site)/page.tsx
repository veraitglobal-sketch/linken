import { HomeContrast } from "@/components/marketing/home-contrast";
import { HomeFaq } from "@/components/marketing/home-faq";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeHighlights } from "@/components/marketing/home-highlights";
import { HomeIconLine } from "@/components/marketing/home-icon-line";
import { HomeOverview } from "@/components/marketing/home-overview";
import { HomeStories } from "@/components/marketing/home-stories";
import { HomeTalks } from "@/components/marketing/home-talks";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeIconLine />
      <HomeOverview />
      <HomeContrast />
      <HomeStories />
      <HomeTalks />
      <HomeHighlights />
      <HomeFaq />
    </>
  );
}
