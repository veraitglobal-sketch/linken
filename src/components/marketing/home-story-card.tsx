import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { HOME_STORIES } from "@/components/marketing/home-stories-data";

type Story = (typeof HOME_STORIES)[number];

export function HomeStoryCard({
  story,
  index,
}: {
  story: Story;
  index: number;
}) {
  return (
    <article
      className={`group grid h-[min(68svh,480px)] w-full overflow-hidden rounded-chapter shadow-chapter ring-1 ring-white/10 ${story.tone} lg:grid-cols-[1.12fr_0.88fr]`}
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
          <p className="mt-6 font-display text-section text-white/[0.96]">
            {story.headline}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-5 border-t border-white/10 pt-6">
          <div>
            <p className="text-[14px] font-semibold text-white">
              {story.sector}
            </p>
            <p className="mt-2 max-w-[28ch] text-[12px] text-white/50">
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
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/30 to-transparent"
          aria-hidden
        />
      </div>
    </article>
  );
}
