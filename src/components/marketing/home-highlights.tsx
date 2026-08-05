import Image from "next/image";
import { EmbedVerified } from "@/components/embed/embed-verified";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";
import { getSiteUrl } from "@/lib/site";

/** Full-bleed photo stage — Verified lockup + network line on the image. */
export function HomeHighlights() {
  const profileUrl = `${getSiteUrl()}/demo`;

  return (
    <HomeSection tone="tight">
      <div className="mx-auto max-w-6xl">
        <HomeEyebrow>On your site</HomeEyebrow>
        <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.042em] text-ink">
          Your proof, rendered on your own page.
        </h2>
        <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-ink-soft">
          The same confirmed records as your Hansala profile — one paste, and it
          stays current.
        </p>

        <div className="relative mt-12 min-h-[min(56vh,520px)] overflow-hidden rounded-[28px] shadow-[0_28px_70px_rgba(10,20,18,0.18)] ring-1 ring-black/[0.04] sm:min-h-[560px] lg:rounded-[32px]">
          <Image
            src="/images/highlight-share.jpg"
            alt="A partner opening a confirmed company page on site"
            fill
            quality={80}
            className="object-cover object-[center_28%]"
            sizes="(max-width: 1024px) 100vw, 1120px"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(200deg,rgba(8,20,18,0.12)_0%,rgba(8,20,18,0.4)_45%,rgba(6,16,14,0.9)_100%)]"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 lg:p-12">
            <div className="[&_span]:drop-shadow-[0_2px_10px_rgba(2,8,7,0.55)]">
              <EmbedVerified
                profileUrl={profileUrl}
                theme="dark"
                size="lg"
              />
            </div>
            <p className="mt-5 max-w-md font-display text-xl leading-snug tracking-[-0.025em] text-white sm:text-2xl">
              Your network travels with every share.
            </p>
            <p className="mt-2 max-w-sm text-[13px] text-white/55">
              Embeds and profile links — same confirmed facts.
            </p>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
