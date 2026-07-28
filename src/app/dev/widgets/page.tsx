import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { EmbedAssessment } from "@/components/embed/embed-assessment";
import { EmbedCredentials } from "@/components/embed/embed-credentials";
import { EmbedHorizontal } from "@/components/embed/embed-horizontal";
import { EmbedMicro } from "@/components/embed/embed-micro";
import { EmbedReferences } from "@/components/embed/embed-references";
import { EmbedScoreBar } from "@/components/embed/embed-score-bar";
import { EmbedSignatureSeal } from "@/components/embed/embed-signature-seal";
import { EmbedStarter } from "@/components/embed/embed-starter";
import { EmbedTrustCard } from "@/components/embed/embed-trust-card";
import { EmbedVerified } from "@/components/embed/embed-verified";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { PreviewStage } from "@/components/widgets/preview-stage";
import type { TrustBreakdown } from "@/features/trust/score";

export const dynamic = "force-dynamic";

const BREAKDOWN: TrustBreakdown = {
  confirmedPartners: 5,
  confirmedReferences: 4,
  ongoingReferences: 3,
  clientConfirmedCaseStudies: 2,
  partnerConfirmedCaseStudies: 1,
  testimonialPoints: 0,
};

const REFS = [
  { clientName: "Nordic Steel", service: "Plant retrofit", period: "since 2022", ongoing: true, initials: "NS" },
  { clientName: "Harbor Labs", service: "Lab fit-out", period: "2021–2023", ongoing: false, initials: "HL" },
];

const PROFILE = "https://linken.local/c/acme-architecture?src=embed";
const BASE = {
  name: "Acme Architecture",
  verified: true,
  level: "Trusted" as const,
  confirmedCount: 12,
  profileUrl: PROFILE,
};

function ThemeBlock({ theme, title }: { theme: EmbedTheme; title: string }) {
  const stage = theme === "dark" ? "#081412" : null;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">{title}</h2>
      <PreviewStage color={stage} className="flex-col items-stretch gap-6 !p-6">
        <Variant label="verified · free" width={240}>
          <EmbedVerified profileUrl={PROFILE} theme={theme} />
        </Variant>
        <Variant label="micro · free" width={520}>
          <EmbedMicro {...BASE} claimed theme={theme} />
        </Variant>
        <Variant label="horizontal · free" width={560}>
          <EmbedHorizontal {...BASE} theme={theme} />
        </Variant>
        <Variant label="starter · pro dark" width={480}>
          <EmbedStarter {...BASE} theme={theme} />
        </Variant>
        <Variant label="score · pro" width={480}>
          <EmbedScoreBar {...BASE} theme={theme} />
        </Variant>
        <Variant label="trust-card · pro" width={440}>
          <EmbedTrustCard {...BASE} breakdown={BREAKDOWN} theme={theme} />
        </Variant>
        <Variant label="credentials · pro" width={400}>
          <EmbedCredentials name={BASE.name} level="Trusted" breakdown={BREAKDOWN} profileUrl={PROFILE} theme={theme} />
        </Variant>
        <Variant label="signature · pro" width={280}>
          <EmbedSignatureSeal {...BASE} theme={theme} />
        </Variant>
        <Variant label="assessment · pro" width={440}>
          <EmbedAssessment
            name={BASE.name}
            wouldYes={9}
            wouldTotal={10}
            topStrengths={[{ label: "Communication", count: 8 }, { label: "Delivery", count: 7 }]}
            confirmedCount={12}
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>
        <Variant label="references · pro" width={460}>
          <EmbedReferences name={BASE.name} totalCount={8} references={REFS} profileUrl={PROFILE} theme={theme} />
        </Variant>
      </PreviewStage>
    </section>
  );
}

function Variant({ label, width, children }: { label: string; width: number; children: ReactNode }) {
  return (
    <div className="w-full">
      <p className="mb-2 text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">{label}</p>
      <div style={{ width, maxWidth: "100%" }}>{children}</div>
    </div>
  );
}

export default function DevWidgetsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-24">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#7eb8a4] uppercase">Dev only</p>
      <h1 className="mt-2 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-medium tracking-[-0.04em] text-ink">
        Embed widgets
      </h1>
      <p className="mt-2 max-w-xl text-[15px] text-ink-soft">
        Logo-free Trustpilot-style widgets — proof strip, counts, and Hansala seal only.
      </p>
      <div className="mt-10 space-y-12">
        <ThemeBlock theme="light" title="Light" />
        <ThemeBlock theme="dark" title="Dark" />
      </div>
    </main>
  );
}
