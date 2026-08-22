import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeHeroSearch } from "@/components/marketing/home-hero-search";
import { NetworkMark } from "@/components/marketing/network-mark";

/**
 * Homepage §1 — dark hero stage; bookend with Close.
 *
 * One full-bleed generated plate rather than a two-column split, the way
 * Retell builds its hero. The copy sits over it on the left, carried by a
 * scrim rather than a panel edge, so there is no seam down the stage.
 */
export function HomeHero() {
  return (
    <section className="px-4 pt-1 lg:flex lg:min-h-[calc(100svh-4.75rem)] lg:items-center">
      <div className="hero-live relative mx-auto w-full max-w-6xl overflow-hidden rounded-hero shadow-hero lg:flex lg:min-h-[82vh] lg:items-center">
        {/* Mobile: the plate is a band, not a crop behind the copy.
            Desktop: fill the stage; the LTR scrim holds the type. */}
        <div className="relative h-[240px] w-full sm:h-[280px] lg:absolute lg:inset-0 lg:h-auto">
          <Image
            src="/images/hero-plate.webp"
            alt=""
            fill
            priority
            fetchPriority="high"
            draggable={false}
            className="pointer-events-none select-none object-cover object-[72%_center] lg:object-center"
            sizes="100vw"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-navy via-navy/80 via-45% to-navy/25 lg:block"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/3 bg-gradient-to-t from-navy/60 to-transparent lg:block"
            aria-hidden
          />
        </div>

        <div className="relative z-10 flex flex-col gap-8 px-7 py-8 sm:px-11 sm:py-10 lg:absolute lg:inset-0 lg:justify-between lg:gap-10 lg:py-12">
          <div className="animate-rise flex items-center gap-2.5">
            <NetworkMark size={17} animate={false} />
            <p className="text-[11px] font-semibold tracking-[0.16em] text-on-navy-muted uppercase">
              Mutual confirmation
            </p>
          </div>

          {/* Headline and CTA are one block: `justify-between` across three
              children split the 82vh stage into two voids mid-copy (measured
              147px). One deliberate gap reads as negative space. */}
          <div className="space-y-10">
            <div className="max-w-2xl">
              <h1 className="animate-rise font-display text-claim text-on-navy text-balance">
                Turn your past work into verified proof.
              </h1>
              <p className="animate-rise-delay mt-6 max-w-md text-lead text-on-navy-soft">
                Invite clients and partners to confirm. Use the same records on
                your profile, website, and proposals — public only after both
                sides agree.
              </p>
            </div>

            <div className="animate-rise-late space-y-5">
              <HomeHeroSearch />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Light, not primary: with `--signal` folded into the brand
                    teal the filled button sits at 2.1:1 against the hero
                    plate. White separates and matches the Close bookend. */}
                <Button
                  href="/onboarding"
                  variant="light"
                  className="h-12 min-w-[200px] px-6"
                >
                  Create your free profile
                </Button>
                <Button
                  href="#how-it-works"
                  variant="onDark"
                  className="h-12 min-w-[200px] px-6"
                >
                  See how it works
                </Button>
              </div>
              <p className="max-w-md text-[12.5px] leading-relaxed text-on-navy-muted">
                For AEC, specialist contractors, agencies, and consulting.{" "}
                <Link
                  href="/demo"
                  className="font-semibold text-on-navy underline-offset-2 hover:underline"
                >
                  Browse the labelled demo
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
