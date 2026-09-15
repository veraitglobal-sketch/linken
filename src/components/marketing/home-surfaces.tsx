import {
  HomePill,
  HomeTitle,
} from "@/components/marketing/home-section";
import {
  SurfaceAccordion,
  type Surface,
} from "@/components/marketing/surface-accordion";

/**
 * Every card names something that exists in this repo — a route, an embed or
 * an endpoint. Nothing here is aspirational, and `source` is printed so a
 * visitor can go and check the claim rather than take it.
 */
const SURFACES: readonly Surface[] = [
  {
    title: "Testimonials on your own site",
    body: "The words the author wrote, rendered on your page. You cannot edit them — nor can we.",
    source: "/api/v1/companies/[slug]/testimonials",
    glyph: "testimonial",
  },
  {
    title: "Partners and the logo wall",
    body: "Only companies that confirmed you. A new confirmation appears without anyone touching the code.",
    source: "/api/v1/companies/[slug]/partners",
    glyph: "logos",
  },
  {
    title: "The verification mark",
    body: "Domain proof and mutual confirmation. There is no price that buys it and no tier printed beside it.",
    source: "/api/badge/[slug]",
    glyph: "mark",
  },
  {
    title: "Your public profile",
    body: "What a buyer sees when they look you up: confirmed records, or no file. Never a rating.",
    source: "/c/[slug]",
    glyph: "profile",
  },
  {
    title: "A one-pager for proposals",
    body: "The same records laid out for print, so a reference list can be attached to a bid.",
    source: "/c/[slug]/one-pager",
    glyph: "onepager",
  },
  {
    title: "The public API",
    body: "Companies, partners, references, case studies and testimonials — documented, and open to read.",
    source: "/api/v1/openapi",
    glyph: "api",
  },
];

/** Homepage §4 — accordion left, a tinted stage bleeding off the right edge. */
export function HomeSurfaces() {
  return (
    <section className="py-14 sm:py-[75px]">
      <div className="px-4 text-center sm:px-[18px]">
        <HomeTitle>One record. Every surface it needs.</HomeTitle>
      </div>

      <div className="mt-12 sm:mt-14">
        <SurfaceAccordion surfaces={SURFACES} />
      </div>

      <div className="mt-12 flex justify-center px-4">
        <HomePill href="/developers">Explore the embeds</HomePill>
      </div>
    </section>
  );
}
