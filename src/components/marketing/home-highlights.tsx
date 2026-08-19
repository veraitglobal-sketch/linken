import Image from "next/image";
import Link from "next/link";
import { EmbedVerified } from "@/components/embed/embed-verified";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";
import { getSiteUrl } from "@/lib/site";

/** Homepage §6b — embed on your site; same confirmed facts as the profile. */
export function HomeHighlights() {
  const profileUrl = `${getSiteUrl()}/demo`;

  return (
    <HomeSection>
      <div className="mx-auto max-w-6xl">
        <HomeEyebrow>On your site</HomeEyebrow>
        <div className="reveal-late mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          <h2 className="reveal max-w-[18ch] font-display text-chapter text-ink text-balance">
            Your proof, rendered on your own page.
          </h2>
          <p className="max-w-[38ch] text-[15px] leading-relaxed text-muted lg:justify-self-end lg:pb-1 lg:text-right">
            Same confirmed records as your Hansala profile — one paste, then it
            stays current.{" "}
            <Link
              href="/developers"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Embed docs
            </Link>
            .
          </p>
        </div>

        <div className="relative mt-11 min-h-[min(56vh,520px)] overflow-hidden rounded-chapter shadow-chapter ring-1 ring-black/[0.04] sm:min-h-[560px] lg:rounded-hero">
          <Image
            src="/images/highlight-share.jpg"
            alt="A partner opening a confirmed company page on site"
            fill
            quality={75}
            className="object-cover object-[center_42%] sm:object-[center_28%]"
            sizes="(max-width: 1024px) 100vw, 1120px"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(200deg,rgba(8,20,18,0.12)_0%,rgba(8,20,18,0.4)_45%,rgba(6,16,14,0.9)_100%)]"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 lg:p-12">
            <EmbedVerified
              profileUrl={profileUrl}
              theme="dark"
              size="lg"
            />
            <p className="mt-5 max-w-md font-display text-xl leading-snug tracking-[-0.025em] text-white sm:text-2xl">
              Your network travels with every share.
            </p>
            <p className="mt-2 max-w-sm text-[13px] text-white/55">
              Embeds and profile links — confirmed facts only.
            </p>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
