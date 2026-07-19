import Image from "next/image";
import { Button } from "@/components/ui/button";

const stories = [
  {
    tone: "bg-[#10231f]",
    quote:
      "Clients finally see our full delivery network — architecture, build, electrical — confirmed, not claimed.",
    person: "Elena Vogt",
    role: "Managing Director, Acme Architecture",
    with: "BauPro · Beta Elektro",
    href: "/c/acme-architecture/case-studies/residence-berlin",
    image: "/images/portrait-2.jpg",
    imageAlt: "Company leader",
  },
  {
    tone: "bg-[#1a3d36]",
    quote:
      "Being confirmed on Acme’s page put us in front of clients who already trusted the lead firm.",
    person: "Markus Stein",
    role: "Owner, BauPro GmbH",
    with: "Shared case study on both profiles",
    href: "/c/acme-architecture/case-studies/office-campus-spandau",
    image: "/images/portrait-1.jpg",
    imageAlt: "Partner company owner",
  },
];

export function HomeStories() {
  return (
    <section className="space-y-5 px-4 pb-24">
      {stories.map((story) => (
        <article
          key={story.person}
          className={`group ${story.tone} mx-auto grid max-w-6xl overflow-hidden rounded-[32px] lg:grid-cols-[1.15fr_0.85fr]`}
        >
          <div className="flex flex-col justify-between px-7 py-9 sm:px-11 sm:py-12">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#c4783a] uppercase">
                Case study
              </p>
              <p className="mt-5 font-display text-[clamp(1.55rem,3vw,2.4rem)] leading-[1.2] tracking-[-0.03em] text-white">
                “{story.quote}”
              </p>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{story.person}</p>
                <p className="text-sm text-white/65">{story.role}</p>
                <p className="mt-2 text-[12px] text-white/45">{story.with}</p>
              </div>
              <Button
                href={story.href}
                variant="light"
                className="h-10 px-4 text-[12px] transition-transform duration-300 group-hover:-translate-y-0.5"
              >
                Read case study
              </Button>
            </div>
          </div>
          <div className="relative min-h-[300px] overflow-hidden">
            <Image
              src={story.image}
              alt={story.imageAlt}
              fill
              className="media-zoom object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </article>
      ))}
    </section>
  );
}
