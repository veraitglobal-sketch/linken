import Image from "next/image";
import {
  HomeBand,
  HomePill,
} from "@/components/marketing/home-section";

/** Homepage §5 — a 900px tinted banner: one sentence, one button, one photograph. */
export function HomeFreeBanner() {
  return (
    <HomeBand>
      <div className="mx-auto grid max-w-[900px] items-center overflow-hidden rounded-[30px] bg-lime sm:grid-cols-[1.6fr_1fr]">
        <div className="p-8 sm:py-10 sm:pr-6 sm:pl-[42px]">
          <h2 className="font-display text-[22px] leading-[1.33] font-semibold tracking-[-0.02em] text-ink sm:text-[24px]">
            Start with a free profile. Your confirmed records stay free — add
            Pro when you want them on your own site.
          </h2>
          <HomePill href="/onboarding" className="mt-8 h-11 text-[16px]">
            Create your free profile
          </HomePill>
        </div>
        <div className="relative h-60 sm:h-full sm:min-h-[300px]">
          <Image
            src="/images/lookup-wide-b1.jpg"
            alt="Two people going through a notebook together at a table"
            fill
            quality={75}
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, 340px"
          />
        </div>
      </div>
    </HomeBand>
  );
}
