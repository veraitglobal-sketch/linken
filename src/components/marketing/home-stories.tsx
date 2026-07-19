import Image from "next/image";
import { Button } from "@/components/ui/button";

const stories = [
  {
    tone: "bg-[#10231f]",
    quote:
      "Clients finally see our full delivery network — architecture, build, electrical — confirmed, not claimed.",
    person: "Elena Vogt",
    role: "Managing Director, architecture firm",
    with: "Partners confirmed on shared case studies",
    href: "/onboarding",
    cta: "Create your company link",
    image: "/images/portrait-2.jpg",
    imageAlt: "Company leader",
  },
  {
    tone: "bg-[#163a32]",
    quote:
      "Being confirmed on a lead firm’s page put us in front of clients who already trusted the network.",
    person: "Markus Stein",
    role: "Owner, general contracting",
    with: "Shared case study on both profiles",
    href: "/search",
    cta: "Find companies",
    image: "/images/portrait-1.jpg",
    imageAlt: "Partner company owner",
  },
  {
    tone: "bg-[#1f6b5c]",
    quote:
      "One link in the proposal. They scan, they verify, they trust the network — before the first meeting.",
    person: "Sofia Keller",
    role: "Head of Sales, specialist trade",
    with: "Verified one-pager attached to every bid",
    href: "/onboarding",
    cta: "Get started",
    image: "/images/site-work.jpg",
    imageAlt: "Project delivery",
  },
];

/**
 * CSS sticky stack (Retell-style): each card pins while you scroll;
 * the next card slides over it. After the last card, the page continues.
 * No JS scroll math — stable in normal document flow.
 */
export function HomeStories() {
  return (
    <section className="relative px-4 pb-8">
      <div className="mx-auto max-w-6xl">
        {stories.map((story, index) => (
          <div
            key={story.person}
            className="sticky top-24 mb-3 last:mb-0"
            style={{ zIndex: index + 1 }}
          >
            <article
              className={`group grid h-[min(72svh,520px)] w-full overflow-hidden rounded-[32px] shadow-[0_28px_70px_rgba(10,20,18,0.25)] ${story.tone} lg:grid-cols-[1.15fr_0.85fr]`}
            >
              <div className="flex flex-col justify-between px-7 py-8 sm:px-11 sm:py-10">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-[#5ec4a8] uppercase">
                    How teams use Linken
                  </p>
                  <p className="mt-5 font-display text-[clamp(1.4rem,2.6vw,2.15rem)] leading-[1.2] tracking-[-0.03em] text-white">
                    “{story.quote}”
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {story.person}
                    </p>
                    <p className="text-sm text-white/65">{story.role}</p>
                    <p className="mt-2 text-[12px] text-white/45">{story.with}</p>
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
              <div className="relative min-h-[200px] overflow-hidden lg:min-h-0">
                <Image
                  src={story.image}
                  alt={story.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority={index === 0}
                />
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
