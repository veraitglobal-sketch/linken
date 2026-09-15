import Image from "next/image";
import Link from "next/link";
import {
  Accent,
  HomeHeading,
  HomeSection,
} from "@/components/marketing/home-section";
import { HOME_STORIES } from "@/components/marketing/home-stories-data";

/**
 * Homepage §5 — sector scenarios, three up.
 *
 * Thrivea's "Can your HRIS do this?" row: photograph, a short claim, one line
 * of proof. Scenarios, never customers — no names, no quotes, no logos.
 */
export function HomeStories() {
  return (
    <HomeSection className="!py-14 sm:!py-16">
      <div className="mx-auto max-w-6xl">
        <HomeHeading
          eyebrow="Proof, not promises"
          title={
            <>
              We don&rsquo;t print logos <Accent>we don&rsquo;t have.</Accent>
            </>
          }
          lead={
            <>
              Every record is confirmed by both companies — including ours.
              Browse the{" "}
              <Link
                href="/demo"
                className="font-semibold text-ink underline-offset-2 hover:underline"
              >
                labelled demo
              </Link>{" "}
              to see what a buyer sees.
            </>
          }
        />

        <ul className="mt-12 grid list-none gap-4 p-0 md:grid-cols-3">
          {HOME_STORIES.map((story) => (
            <li
              key={story.sector}
              className="lift group flex flex-col rounded-card bg-surface p-3 ring-1 ring-line/70"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-tile">
                <Image
                  src={story.image}
                  alt={story.imageAlt}
                  fill
                  quality={75}
                  loading="lazy"
                  className={`media-zoom object-cover ${story.focus}`}
                  sizes="(max-width: 768px) 100vw, 370px"
                />
                <span className="absolute top-3 left-3 inline-flex h-7 items-center rounded-full bg-blue px-3 text-[10.5px] font-semibold tracking-[0.14em] text-on-navy uppercase shadow-[0_6px_16px_-6px_rgba(8,20,18,0.5)]">
                  {story.sector}
                </span>
              </div>
              <div className="flex flex-1 flex-col px-3 pt-5 pb-3">
                <p className="font-display text-[19px] leading-[1.25] font-medium tracking-[-0.025em] text-ink text-balance">
                  {story.headline}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-muted">
                  {story.detail}
                </p>
                <div className="mt-auto pt-6">
                  <Link
                    href={story.href}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-wash-deep px-5 text-[13px] font-semibold text-navy transition-colors duration-200 group-hover:bg-blue group-hover:text-on-navy"
                  >
                    {story.cta}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </HomeSection>
  );
}
