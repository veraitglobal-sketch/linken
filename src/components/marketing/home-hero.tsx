import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NetworkMark } from "@/components/marketing/network-mark";

/** Homepage §1 — dark hero stage; bookend with Close. */
export function HomeHero() {
  return (
    <section className="flex min-h-[calc(100svh-4.75rem)] items-center px-4 pt-1">
      <div className="hero-live relative mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-hero shadow-hero lg:min-h-[82vh] lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative z-10 flex flex-col justify-between gap-10 px-7 py-9 sm:px-11 sm:py-12">
          <div className="animate-rise flex items-center gap-2.5">
            <NetworkMark size={17} animate={false} />
            <p className="text-[11px] font-semibold tracking-[0.16em] text-on-navy-muted uppercase">
              Mutual confirmation
            </p>
          </div>

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

        <div className="relative min-h-[280px] lg:min-h-full">
          <Image
            src="/images/hero-partner-v3.jpg"
            alt="Architecture firm partner reviewing plans outside a project site"
            fill
            priority
            fetchPriority="high"
            unoptimized
            className="object-cover object-[center_28%]"
            sizes="(max-width: 1024px) 100vw, 900px"
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-navy via-navy/35 to-transparent"
            aria-hidden
          />
          <p className="absolute right-4 bottom-4 left-4 text-right text-[11px] font-medium tracking-[-0.01em] text-on-navy/70 sm:right-6 sm:bottom-6">
            Real work context — never invented logos
          </p>
        </div>
      </div>
    </section>
  );
}
