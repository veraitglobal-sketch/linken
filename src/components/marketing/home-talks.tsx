import Image from "next/image";
import Link from "next/link";
import { EmbedVerified } from "@/components/embed/embed-verified";
import {
  Accent,
  HomeHeading,
  HomeSection,
} from "@/components/marketing/home-section";
import { ShareMomentGraph } from "@/components/marketing/share-moment-graph";
import { getSiteUrl } from "@/lib/site";

/** The embed rules from AGENTS.md, stated as what a customer gets. */
const EMBED_FACTS = [
  {
    title: "Embed once",
    body: "Everything after the paste is a setting. A new confirmed partner appears without anyone touching code.",
  },
  {
    title: "Your look, our mark",
    body: "Colour, type and spacing can match your site. Only the check mark is ours, and it cannot be hidden.",
  },
  {
    title: "No tier on your page",
    body: "Your visitors never see a plan name beside the mark — it reads as earned, because it was.",
  },
] as const;

/**
 * Homepage §6 — the share moment and the embed, as one bento.
 *
 * Thrivea's tinted feature grid. The two large tiles carry the section's
 * anchors — the draggable share graph and the real `EmbedVerified` on a
 * photograph — and the row beneath states the embed rules as plain facts.
 */
export function HomeTalks() {
  const profileUrl = `${getSiteUrl()}/demo`;

  return (
    <HomeSection className="!py-14 sm:!py-16">
      <div className="mx-auto max-w-6xl">
        <HomeHeading
          eyebrow="Wherever you send it"
          title={
            <>
              Send one link. <Accent>Bring the whole team.</Accent>
            </>
          }
          lead="Confirmed partners and projects travel with every proposal, pitch, and introduction — the same facts, wherever you send them."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <article className="grad-mint flex flex-col overflow-hidden rounded-card p-7 sm:p-9 lg:col-span-7">
            <h3 className="font-display text-[22px] leading-tight font-medium tracking-[-0.03em] text-ink">
              The share moment
            </h3>
            <p className="mt-2 max-w-[42ch] text-[14.5px] leading-relaxed text-ink-soft">
              One profile link carries the whole confirmed network. Drag the
              nodes — the links hold.
            </p>
            <div className="mt-auto pt-6">
              <ShareMomentGraph />
            </div>
          </article>

          <article className="relative min-h-[420px] overflow-hidden rounded-card lg:col-span-5">
            <Image
              src="/images/highlight-share.jpg"
              alt="A partner opening a confirmed company page on site"
              fill
              quality={75}
              className="object-cover object-[center_30%]"
              sizes="(max-width: 1024px) 100vw, 470px"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(190deg,rgba(8,20,18,0.05)_0%,rgba(8,20,18,0.35)_45%,rgba(6,16,14,0.9)_100%)]"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
              <EmbedVerified profileUrl={profileUrl} theme="dark" size="lg" />
              <h3 className="mt-5 max-w-[20ch] font-display text-[22px] leading-tight font-medium tracking-[-0.03em] text-white">
                Your proof, rendered on your own page.
              </h3>
              <p className="mt-2 max-w-[36ch] text-[13.5px] leading-relaxed text-on-navy-soft">
                Same confirmed records as your profile — one paste, then it
                stays current.{" "}
                <Link
                  href="/developers"
                  className="font-semibold text-white underline-offset-2 hover:underline"
                >
                  Embed docs
                </Link>
                .
              </p>
            </div>
          </article>

          {EMBED_FACTS.map((fact) => (
            <article
              key={fact.title}
              className="lift rounded-card bg-surface p-7 ring-1 ring-line/70 lg:col-span-4"
            >
              <span
                aria-hidden
                className="grad-teal grid size-11 place-items-center rounded-2xl shadow-[0_8px_18px_-8px_rgba(26,92,81,0.7)]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="m3.5 8.5 3 3 6-7"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3 className="mt-5 font-display text-[18px] leading-tight font-medium tracking-[-0.025em] text-ink">
                {fact.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                {fact.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </HomeSection>
  );
}
