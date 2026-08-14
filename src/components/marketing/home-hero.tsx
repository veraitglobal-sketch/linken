import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <section className="flex min-h-[calc(100svh-4.75rem)] items-center px-4 pt-1">
      <div className="hero-live relative mx-auto flex w-full max-w-6xl items-center overflow-hidden rounded-hero shadow-hero lg:min-h-[82vh]">
        <Image
          src="/images/hero-plate.webp"
          alt=""
          fill
          priority
          fetchPriority="high"
          className="object-cover object-center"
          sizes="100vw"
          aria-hidden
        />

        {/* The plate runs pale on the left, which is exactly where the headline
            sits. A horizontal ink ramp holds the copy column; a low vertical
            wash keeps the small print at the foot from going grey. */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy via-navy/80 via-45% to-navy/25"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/60 to-transparent"
          aria-hidden
        />

        <div className="relative z-10 flex w-full flex-col justify-between gap-10 px-7 py-9 sm:px-11 sm:py-12">
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  href="/onboarding"
                  variant="primary"
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
