import Link from "next/link";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";
import { HOME_STORIES } from "@/components/marketing/home-stories-data";
import { HomeStoryCard } from "@/components/marketing/home-story-card";

/** Sticky stack: staggered top so closed cards keep a visible ridge. */
const STACK_TOP = "6rem";
const PEEK = 28;
const LAST = HOME_STORIES.length - 1;

/** Homepage §5b — sector scenarios; no invented customers or quotes. */
export function HomeStories() {
  return (
    <HomeSection>
      <div className="mx-auto mb-12 max-w-6xl">
        <HomeEyebrow>Proof, not promises</HomeEyebrow>
        <div className="reveal-late mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-14">
          <h2 className="reveal max-w-[18ch] font-display text-chapter text-ink text-balance">
            We don&rsquo;t print logos we don&rsquo;t have.
          </h2>
          <p className="max-w-[38ch] text-[15px] leading-relaxed text-muted lg:justify-self-end lg:pb-1 lg:text-right">
            Every record is confirmed by both companies — including ours. Browse
            the{" "}
            <Link
              href="/demo"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              labelled demo
            </Link>{" "}
            to see what a buyer sees.
          </p>
        </div>
      </div>

      <div
        className="mx-auto max-w-6xl"
        /* Runway for the last card to sit pinned before the section releases.
           Was 32svh — 288px on a 900px viewport — and since the card is only
           404px tall, that scroll was spent looking at white beneath it. Now
           8svh: about 72px, enough that the last card is not yanked away the
           instant it lands, and little enough that the gap no longer reads as
           a mistake. Below roughly 6svh the stack stops resolving and the last
           card releases before it has been seen. */
        style={{ paddingBottom: `calc(8svh + ${LAST * PEEK}px)` }}
      >
        {HOME_STORIES.map((story, index) => (
          <div
            key={story.sector}
            className="sticky mb-5 last:mb-0"
            style={{
              zIndex: index + 1,
              top: `calc(${STACK_TOP} + ${index * PEEK}px)`,
            }}
          >
            <HomeStoryCard story={story} />
          </div>
        ))}
      </div>
    </HomeSection>
  );
}
