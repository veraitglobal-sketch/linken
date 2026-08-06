import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

/** Sector scenarios — no invented customers, names, or quotes. */
const scenarios = [
  {
    tone: "bg-[#0e1f1c]",
    sector: "Architecture & engineering",
    headline:
      "Show the delivery network behind every project — design, build, and specialist trades, each confirmed by the other side.",
    detail: "Shared case studies appear on both firms' profiles.",
    href: "/onboarding",
    cta: "Create your free profile",
    image: "/images/story-projects.jpg",
    imageAlt: "Architectural plans, hard hat, and tools on a project desk",
    focus: "object-[center_42%]",
  },
  {
    tone: "bg-[#142a25]",
    sector: "Construction & contracting",
    headline:
      "Subcontractors appear confirmed on the lead firm's page — visible to clients who already trust that network.",
    detail: "One record, published on both sides.",
    href: "/demo",
    cta: "See a live example",
    image: "/images/story-collaboration-v2.jpg",
    imageAlt:
      "Contractor on a construction site in front of a modern concrete building",
    focus: "object-[center_28%]",
  },
  {
    tone: "bg-[#1a3530]",
    sector: "Agencies & consultancies",
    headline:
      "One link in the proposal. The buyer opens it, sees confirmed clients and partners, and verifies before the first meeting.",
    detail: "A one-pager with the same confirmed records, for every bid.",
    href: "/onboarding",
    cta: "Create your free profile",
    image: "/images/story-team.jpg",
    imageAlt: "Delivery team reviewing a shared project brief",
    focus: "object-center",
  },
];

/** Sticky stack: staggered top so closed cards keep a visible ridge. */
const STACK_TOP = "6rem";
const PEEK = 28;
const LAST = scenarios.length - 1;

export function HomeStories() {
  return (
    <HomeSection tone="tight" className="!pb-8 sm:!pb-10">
      <div className="mx-auto mb-12 max-w-6xl">
        <HomeEyebrow>Proof, not promises</HomeEyebrow>
        <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.042em] text-ink">
          We don&rsquo;t print logos we don&rsquo;t have.
        </h2>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
          Every record on Hansala is confirmed by both companies — including
          ours. Browse the{" "}
          <Link
            href="/demo"
            className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            demo profile
          </Link>{" "}
          (sample data, clearly labelled) to see exactly what a buyer sees.
        </p>
      </div>

      {/* Extra bottom pad keeps staggered sticky tops from collapsing flat. */}
      <div
        className="mx-auto max-w-6xl"
        style={{ paddingBottom: `calc(32svh + ${LAST * PEEK}px)` }}
      >
        {scenarios.map((story, index) => (
          <div
            key={story.sector}
            className="sticky mb-5 last:mb-0"
            style={{
              zIndex: index + 1,
              top: `calc(${STACK_TOP} + ${index * PEEK}px)`,
            }}
          >
            <article
              className={`group grid h-[min(68svh,480px)] w-full overflow-hidden rounded-[28px] shadow-[0_28px_70px_rgba(10,20,18,0.22)] ring-1 ring-white/10 ${story.tone} lg:grid-cols-[1.12fr_0.88fr]`}
            >
              <div className="flex flex-col justify-between px-7 py-8 sm:px-10 sm:py-10">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-soft/90 uppercase">
                      How teams use Hansala
                    </p>
                    <span className="text-[11px] tabular-nums text-white/30">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-6 font-display text-[clamp(1.35rem,2.5vw,2.05rem)] leading-[1.28] tracking-[-0.032em] text-white/[0.96]">
                    {story.headline}
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap items-end justify-between gap-5 border-t border-white/10 pt-6">
                  <div>
                    <p className="text-[14px] font-semibold text-white">
                      {story.sector}
                    </p>
                    <p className="mt-2 text-[12px] text-white/50">
                      {story.detail}
                    </p>
                  </div>
                  <Button
                    href={story.href}
                    variant="light"
                    className="h-10 px-4 text-[12px]"
                  >
                    {story.cta}
                  </Button>
                </div>
              </div>
              <div className="relative min-h-[190px] overflow-hidden lg:min-h-0">
                <Image
                  src={story.image}
                  alt={story.imageAlt}
                  fill
                  quality={72}
                  loading="lazy"
                  className={`media-zoom object-cover ${story.focus}`}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/30 to-transparent" />
              </div>
            </article>
          </div>
        ))}
      </div>
    </HomeSection>
  );
}
