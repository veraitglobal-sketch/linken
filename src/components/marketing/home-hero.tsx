import Link from "next/link";
import { HomeHeroSearch } from "@/components/marketing/home-hero-search";
import { HomeHeroStage } from "@/components/marketing/home-hero-stage";
import { HomeVideoButton } from "@/components/marketing/home-video-button";

/**
 * Homepage §1 — Thrivea's hero, in Hansala's material.
 *
 * Measured against thrivea.com at 1440: a saturated band under a floating
 * nav, one centred claim at ~62px, one line beneath, two pills, one line of
 * fine print, a row of icon tabs, then the product in a thin translucent
 * frame starting ~500px down — so a third of the window is above the fold.
 * No eyebrow, no underline, no second colour in the claim: the band and the
 * product carry the colour, the type stays ink.
 *
 * `.home-wash` also tints the page ground below (see globals.css). The
 * section is pulled up under the sticky header so the band starts at the top
 * edge of the viewport.
 */
export function HomeHero() {
  return (
    <section className="home-wash relative -mt-[4.25rem] px-4 pt-[8.5rem] pb-10 sm:px-6 sm:pt-[9.5rem] lg:px-8">
      {/* The coloured block, not a fade: a solid lime field with large rounded
          lower corners that ends partway down the product window, so the
          window visibly crosses from the colour onto the page. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 bottom-[22%] rounded-b-[48px] bg-lime sm:bottom-[30%] sm:rounded-b-[120px]"
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center text-center">
          <h1 className="animate-rise font-display text-[clamp(2.4rem,4.3vw,3.875rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-ink text-balance xl:whitespace-nowrap">
            Turn your past work into verified proof.
          </h1>

          <p className="animate-rise-delay mt-6 max-w-[58ch] text-[17px] leading-[1.6] text-ink-soft sm:text-[18px]">
            Invite clients and partners to confirm. Use the same records on your
            profile, website, and proposals — public only after both sides
            agree.
          </p>

          {/* Look a company up straight from the hero — the product's first
              question is "does this company have a record?". */}
          <div className="animate-rise-delay relative z-30 mt-8 w-full max-w-md">
            <HomeHeroSearch tone="light" />
          </div>

          <div className="animate-rise-late mt-6 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href="/onboarding"
              className="inline-flex h-[50px] items-center justify-center gap-2.5 rounded-full bg-navy px-6 text-[16px] font-semibold text-on-navy transition-colors duration-200 hover:bg-navy-deep"
            >
              <span aria-hidden>→</span>
              Create your free profile
            </Link>
            <HomeVideoButton />
          </div>

          <p className="animate-rise-late mt-4 text-[14px] leading-relaxed text-ink">
            Free for confirmed records. For AEC, contractors, agencies and
            consulting.{" "}
            <Link
              href="/demo"
              className="font-semibold underline underline-offset-2 hover:no-underline"
            >
              See the demo
            </Link>
          </p>
        </div>

        <div className="animate-rise-late mt-14">
          <HomeHeroStage />
        </div>
      </div>
    </section>
  );
}
