import Image from "next/image";
import Link from "next/link";
import { HomeSection } from "@/components/marketing/home-section";

/**
 * The light one, before the heavy close.
 *
 * Every other section on this page asks for something: create a profile, invite
 * a partner, read how it works. This one asks for nothing — it invites a look.
 * The page needed a register that is not a pitch, and `HomeClose` right after it
 * is a dark full-bleed stage with video, so without this the last third of the
 * page is two formal blocks in a row.
 *
 * The ask is deliberately not the one the reference does. Trustpilot can say
 * "share your experience" because anyone may write there. Here nobody writes
 * about themselves and nothing is public until the other side confirms, so
 * "leave a review" would be inviting people to do the one thing the product
 * forbids. Looking a company up costs nothing and is true to the frame: this is
 * a file you check, not a wall you post on.
 *
 * Photographs, not illustration — Hansala's own, from `public/images`. Real
 * people and real work is what AGENTS.md calls for, and it is what makes the
 * band read as human rather than as another product panel.
 */

/* Measured, not assumed: `public/images` holds exactly two portrait photographs
   (0.75) and everything else is landscape (1.50). A row of three portrait tiles
   like the reference would mean cropping ~45% off the width of two landscape
   shots, which is how faces end up outside the frame. So the composition bends
   to the assets instead: the tall one stands alone, the two wide ones stack
   beside it, and nothing is cropped at all. */
const TALL = "/images/story-collaboration-v2.jpg";
const WIDE = ["/images/story-team.jpg", "/images/story-projects.jpg"];

export function HomeLookUp() {
  return (
    <HomeSection className="!py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 rounded-hero bg-[#f4f6f4] px-8 py-10 sm:px-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <h2 className="font-display text-[clamp(1.7rem,3vw,2.2rem)] leading-[1.1] font-medium tracking-[-0.035em] text-ink text-balance">
              See if a company already has a file.
            </h2>
            <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-muted">
              Search any company. You will find confirmed records, or nothing at
              all — and nothing is not a mark against anyone.
            </p>
            <Link
              href="/search"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-navy px-5 text-[13px] font-semibold text-on-navy transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Look up a company
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[20px]">
              <Image
                src={TALL}
                alt=""
                fill
                sizes="(max-width: 1024px) 45vw, 280px"
                className="object-cover"
              />
            </div>
            <div className="grid gap-3">
              {WIDE.map((src) => (
                <div
                  key={src}
                  className="relative aspect-[3/2] overflow-hidden rounded-[20px]"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 45vw, 280px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
