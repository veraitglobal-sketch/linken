import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HomeSection } from "@/components/marketing/home-section";

const stories = [
  {
    tone: "bg-[#0e1f1c]",
    quote:
      "Clients finally see our full delivery network — architecture, build, electrical — confirmed, not claimed.",
    person: "Elena Vogt",
    role: "Managing Director, architecture firm",
    with: "Partners confirmed on shared case studies",
    href: "/onboarding",
    cta: "Create company",
    image: "/images/story-projects.jpg",
    imageAlt: "Architectural plans, hard hat, and tools on a project desk",
    focus: "object-[center_42%]",
  },
  {
    tone: "bg-[#142a25]",
    quote:
      "Being confirmed on a lead firm’s page put us in front of clients who already trusted the network.",
    person: "Markus Stein",
    role: "Owner, general contracting",
    with: "Shared case study on both profiles",
    href: "/demo",
    cta: "See an example",
    image: "/images/story-collaboration-v2.jpg",
    imageAlt:
      "Contractor on a construction site in front of a modern concrete building",
    focus: "object-[center_28%]",
  },
  {
    tone: "bg-[#1a3530]",
    quote:
      "One link in the proposal. They scan, they verify, they trust the network — before the first meeting.",
    person: "Sofia Keller",
    role: "Head of Sales, specialist trade",
    with: "Verified one-pager attached to every bid",
    href: "/onboarding",
    cta: "Create company",
    image: "/images/story-team.jpg",
    imageAlt: "Delivery team reviewing a shared project brief",
    focus: "object-center",
  },
];

/** Sticky stack: each card pins; the next slides over it. */
export function HomeStories() {
  return (
    <HomeSection tone="tight" className="!pb-8 sm:!pb-10">
      <div className="mx-auto max-w-6xl">
        {stories.map((story, index) => (
          <div
            key={story.person}
            className="sticky top-24 mb-4 last:mb-0"
            style={{ zIndex: index + 1 }}
          >
            <article
              className={`group grid h-[min(70svh,500px)] w-full overflow-hidden rounded-[28px] shadow-[0_28px_70px_rgba(10,20,18,0.22)] ring-1 ring-white/5 ${story.tone} lg:grid-cols-[1.12fr_0.88fr]`}
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
                    “{story.quote}”
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap items-end justify-between gap-5 border-t border-white/10 pt-6">
                  <div>
                    <p className="text-[14px] font-semibold text-white">
                      {story.person}
                    </p>
                    <p className="mt-0.5 text-[13px] text-white/60">{story.role}</p>
                    <p className="mt-2 text-[12px] text-white/40">{story.with}</p>
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
