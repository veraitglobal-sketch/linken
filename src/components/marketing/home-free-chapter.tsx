import Image from "next/image";
import {
  HomeBand,
  HomePill,
  HomeTitle,
} from "@/components/marketing/home-section";
import {
  FREE_PLAN_PRICE,
  PRO_PLAN_PRICE,
} from "@/features/plan/pricing";

/** Homepage §7 — second dark chapter: what is free, what Pro adds. */
export function HomeFreeChapter() {
  return (
    <HomeBand>
      <div className="relative overflow-hidden rounded-[32px] bg-navy px-6 pt-12 pb-12 sm:rounded-[60px] sm:px-12 lg:px-20 lg:pt-6 lg:pb-12">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="lg:py-20">
            <HomeTitle onDark>
              The record is free.
              <br />
              <span className="text-lime">Pro is reach.</span>
            </HomeTitle>
            <p className="mt-8 max-w-[52ch] text-[16px] leading-relaxed text-on-navy">
              Your company profile, domain verification and every mutual
              confirmation cost nothing — the record itself is never behind a
              plan.
            </p>
            <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-on-navy">
              Pro puts it in front of people: testimonials and partner logos on
              your own site, profile analytics, the API and a one-pager for
              proposals.
            </p>
            <p className="mt-5 text-[16px] font-bold text-on-navy">
              Free {FREE_PLAN_PRICE}. Pro {PRO_PLAN_PRICE}.
            </p>
          </div>

          <figure className="m-0 flex flex-col items-center lg:pt-14">
            <div className="relative w-full max-w-[560px]">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-white/10">
                <Image
                  src="/images/lookup-wide-a2.jpg"
                  alt="Two people in a large, empty concrete hall"
                  fill
                  quality={75}
                  className="object-cover object-[60%_center]"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
              </div>
            </div>
            <figcaption className="mt-10 font-display text-[24px] font-semibold tracking-[-0.02em] text-on-navy">
              Earned, not bought.
            </figcaption>
          </figure>
        </div>

        <div className="mt-10 flex justify-center lg:mt-4">
          <HomePill href="/onboarding" tone="mint">
            Create your free profile
          </HomePill>
        </div>
      </div>
    </HomeBand>
  );
}
