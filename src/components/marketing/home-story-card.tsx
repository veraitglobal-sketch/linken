import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { HOME_STORIES } from "@/components/marketing/home-stories-data";

type Story = (typeof HOME_STORIES)[number];

export function HomeStoryCard({ story }: { story: Story }) {
  return (
    <article
      /* One ground for all three. The cards carried #081412, #14352e and
         #1a5c51 — three green surfaces, and the last is --blue, a text accent
         stretched across a whole card. The photography is what should differ
         between them, not the paint. */
      className="group grid h-[min(58svh,404px)] w-full overflow-hidden rounded-chapter bg-navy-deep shadow-chapter ring-1 ring-white/10 lg:grid-cols-[1.12fr_0.88fr]"
    >
      <div className="flex flex-col justify-between px-7 py-8 sm:px-10 sm:py-10">
        <div>
          {/* The sector leads. "How teams use Hansala" is the section's
              label and was repeated on all three cards, while 01/02/03 implied
              a sequence — these are three audiences, not three steps. */}
          <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-soft/90 uppercase">
            {story.sector}
          </p>
          <p className="mt-6 max-w-[26ch] font-display text-[clamp(1.35rem,2vw,1.7rem)] leading-[1.18] font-medium tracking-[-0.03em] text-white/[0.96]">
            {story.headline}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-5 border-t border-white/10 pt-6">
          <p className="max-w-[34ch] text-[13px] leading-relaxed text-white/55">
            {story.detail}
          </p>
          <Button
            href={story.href}
            variant="light"
            className="h-10 px-4 text-[12px]"
          >
            {story.cta}
          </Button>
        </div>
      </div>
      <div className="relative min-h-[190px] p-3 sm:p-4 lg:min-h-0 lg:py-5 lg:pr-5 lg:pl-0">
        <div className="relative h-full w-full overflow-hidden rounded-card">
        <Image
          src={story.image}
          alt={story.imageAlt}
          fill
          quality={72}
          loading="lazy"
          className={`media-zoom object-cover ${story.focus}`}
          sizes="(max-width: 1024px) 100vw, 40vw"
        />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/25 to-transparent"
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}
