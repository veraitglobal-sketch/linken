import Link from "next/link";
import { HomeLookUpFrame } from "@/components/marketing/home-look-up-frame";
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
 * Photographs, not illustration. Real people and real work is what AGENTS.md
 * calls for, and it is what makes the band read as human rather than as another
 * product panel. Nobody in them faces the camera: "unposed" is the written rule,
 * and a frontal portrait is also the thing that most gives a generated image
 * away.
 */

/* Three frames, six photographs, two per frame — shot and exported to the ratio
   each frame actually renders, so nothing is cropped and no face drifts out of
   the picture. The tall frame is 3:4, the two wide ones 3:2, matching the files
   in `public/images`.

   Each frame wipes in its own direction and they are staggered around the
   cycle, so exactly one photograph is moving at any moment. `PERIOD` is per
   frame; with three frames offset by a third of it, something changes roughly
   every three seconds while the band itself stays calm. */
const PERIOD = 9000;

const FRAMES = [
  {
    srcs: ["/images/lookup-tall-a.jpg", "/images/lookup-tall-b.jpg"],
    direction: "down" as const,
    ratioClass: "aspect-[3/4]",
    delayMs: 0,
  },
  {
    srcs: ["/images/lookup-wide-a1.jpg", "/images/lookup-wide-a2.jpg"],
    direction: "across" as const,
    ratioClass: "aspect-[3/2]",
    delayMs: PERIOD / 3,
  },
  {
    srcs: ["/images/lookup-wide-b1.jpg", "/images/lookup-wide-b2.jpg"],
    direction: "up" as const,
    ratioClass: "aspect-[3/2]",
    delayMs: (PERIOD / 3) * 2,
  },
];

const SIZES = "(max-width: 1024px) 45vw, 280px";

export function HomeLookUp() {
  return (
    <HomeSection tone="mute" className="!py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 rounded-hero px-0 py-0 sm:px-0 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
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
            <HomeLookUpFrame
              srcs={FRAMES[0]!.srcs}
              direction={FRAMES[0]!.direction}
              ratioClass={FRAMES[0]!.ratioClass}
              delayMs={FRAMES[0]!.delayMs}
              periodMs={PERIOD}
              sizes={SIZES}
              priority
            />
            <div className="grid gap-3">
              {FRAMES.slice(1).map((frame) => (
                <HomeLookUpFrame
                  key={frame.srcs[0]}
                  srcs={frame.srcs}
                  direction={frame.direction}
                  ratioClass={frame.ratioClass}
                  delayMs={frame.delayMs}
                  periodMs={PERIOD}
                  sizes={SIZES}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
