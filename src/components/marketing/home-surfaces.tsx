import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";
import {
  SurfaceCarousel,
  type Surface,
} from "@/components/marketing/surface-carousel";

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

/** Homepage — the surfaces a confirmed record renders on. */
export function HomeSurfaces() {
  return (
    <HomeSection>
      <div className="mx-auto max-w-6xl">
        <HomeEyebrow>One record, every surface</HomeEyebrow>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          <h2 className="max-w-[18ch] font-display text-chapter text-ink text-balance">
            Written once. Rendered everywhere it is needed.
          </h2>
          <p className="max-w-[36ch] text-[15px] leading-relaxed text-muted lg:justify-self-end lg:pb-1 lg:text-right">
            Embed once and configure from the dashboard. Every surface below is
            a route you can open today.
          </p>
        </div>

        <div className="mt-12">
          <SurfaceCarousel surfaces={SURFACES} />
        </div>
      </div>
    </HomeSection>
  );
}
