import Image from "next/image";
import {
  HomeBand,
  HomePill,
  HomeTitle,
} from "@/components/marketing/home-section";

/**
 * Homepage §2 — first dark chapter: photograph left, the rule right.
 *
 * Layout follows the reference: an 18px-inset navy block at 60px radius with
 * a lime lip showing beneath it. The visual is the mark embossed in
 * paper.
 */
export function HomeRuleChapter() {
  return (
    <HomeBand>
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-x-[-6px] top-1/3 bottom-[-18px] rounded-[40px] bg-lime sm:inset-x-[-8px] sm:rounded-[64px]"
        />
        <div className="relative grid items-center gap-10 overflow-hidden rounded-[32px] bg-navy px-6 py-12 sm:rounded-[60px] sm:px-12 lg:grid-cols-2 lg:gap-16 lg:px-20 lg:py-0">
          {/* The mark, embossed into paper — a real object, not a mock. */}
          <div className="lg:py-24">
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl ring-1 ring-white/10">
              <Image
                src="/images/offer-emboss.webp"
                alt="Hansala's mark embossed into a sheet of paper on concrete"
                fill
                quality={75}
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 580px"
              />
            </div>
          </div>

          <div className="pt-6 lg:py-24">
            <HomeTitle onDark>
              Two companies.
              <br />
              <span className="text-lime">One confirmation.</span>
            </HomeTitle>
            <p className="mt-8 text-[17px] leading-relaxed text-on-navy">
              A company cannot state who it worked for.
            </p>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-on-navy">
              Only the other side can confirm it. Until they do, the record
              stays private. Once they do, it shows on both profiles.
            </p>
            <HomePill href="/demo" tone="mint" className="mt-8">
              See a live example
            </HomePill>
          </div>
        </div>
      </div>
    </HomeBand>
  );
}
