import Image from "next/image";
import { EmbedVerified } from "@/components/embed/embed-verified";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";
import { TrustLedger } from "@/components/marketing/trust-ledger";
import { DEMO_COMPANY, getDemoTrust } from "@/data/mock/demo-profile";
import { trustEvidenceLines } from "@/features/trust/score";
import { getSiteUrl } from "@/lib/site";

export function HomeHighlights() {
  const trust = getDemoTrust();
  const lines = trustEvidenceLines(trust.breakdown);
  const profileUrl = `${getSiteUrl()}/demo`;

  return (
    <HomeSection tone="tight">
      <div className="mx-auto max-w-6xl">
        <HomeEyebrow>On your site</HomeEyebrow>
        <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.042em] text-ink">
          Your proof, rendered on your own page.
        </h2>
        <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-ink-soft">
          The same confirmed records as your Hansala profile, placed where the
          buyer already is. One paste, and it keeps itself current.
        </p>

        <div className="mt-12 grid overflow-hidden rounded-[28px] shadow-[0_28px_70px_rgba(10,20,18,0.22)] ring-1 ring-black/[0.05] lg:grid-cols-[1.05fr_0.95fr]">
          {/* The ledger — the one figure the product actually earns. */}
          <TrustLedger
            points={trust.points}
            level={trust.level}
            lines={lines}
          />

          {/* The human half — and the component that actually ships. */}
          <div className="relative min-h-[320px] lg:min-h-0">
            <Image
              src="/images/highlight-share.jpg"
              alt="A partner opening a confirmed company page on site"
              fill
              quality={80}
              className="object-cover object-[center_32%]"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(200deg,rgba(8,20,18,0.25)_0%,rgba(8,20,18,0.5)_55%,rgba(6,16,14,0.92)_100%)]"
              aria-hidden
            />
            {/* The mark itself in the foreground — no white plate under it,
                so it sits on the host's own surface the way it ships. */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div className="[&_span]:drop-shadow-[0_2px_10px_rgba(2,8,7,0.55)]">
                <EmbedVerified
                  profileUrl={profileUrl}
                  theme="dark"
                  size="lg"
                />
              </div>
              <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-white/55">
                A live component, not a screenshot — this is what a paste puts
                on your page.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
          <p className="max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            Everything after the paste is a setting. A newly confirmed partner
            appears on your page without anyone touching the code again — and
            nothing renders that both companies have not confirmed.
          </p>
          <p className="shrink-0 text-[12px] text-muted">
            {DEMO_COMPANY.name} — demo profile, not a real company.
          </p>
        </div>
      </div>
    </HomeSection>
  );
}
