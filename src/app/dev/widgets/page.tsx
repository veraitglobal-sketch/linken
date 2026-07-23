import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { EmbedAssessment } from "@/components/embed/embed-assessment";
import { EmbedBadge } from "@/components/embed/embed-badge";
import type { EmbedProofCompany } from "@/components/embed/embed-brand";
import { EmbedCompact } from "@/components/embed/embed-compact";
import { EmbedCredentials } from "@/components/embed/embed-credentials";
import {
  EmbedLogoWall,
  EmbedLogoWallProFallback,
} from "@/components/embed/embed-logo-wall";
import { EmbedNetworkCard } from "@/components/embed/embed-network-card";
import { EmbedProofPanel } from "@/components/embed/embed-proof-panel";
import { EmbedReferences } from "@/components/embed/embed-references";
import { EmbedSignatureSeal } from "@/components/embed/embed-signature-seal";
import { EmbedTrustCard } from "@/components/embed/embed-trust-card";
import { EmbedVerified } from "@/components/embed/embed-verified";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { PreviewStage } from "@/components/widgets/preview-stage";
import type { TrustBreakdown } from "@/features/trust/score";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";

export const dynamic = "force-dynamic";

const PROOF: EmbedProofCompany[] = [
  { name: "Nordic Steel", initials: "NS", website: "https://example.com" },
  { name: "Harbor Labs", initials: "HL", website: "https://example.org" },
  { name: "Cascade Digits", initials: "CD" },
  { name: "Vera Transit", initials: "VT" },
  { name: "Oak & Pine", initials: "OP" },
];

const BREAKDOWN: TrustBreakdown = {
  confirmedPartners: 5,
  confirmedReferences: 4,
  ongoingReferences: 3,
  clientConfirmedCaseStudies: 2,
  partnerConfirmedCaseStudies: 1,
};

const REFS = [
  {
    clientName: "Nordic Steel",
    service: "Plant retrofit",
    period: "since 2022",
    ongoing: true,
    initials: "NS",
  },
  {
    clientName: "Harbor Labs",
    service: "Lab fit-out",
    period: "2021–2023",
    ongoing: false,
    initials: "HL",
  },
];

const WALL: LogoWallEntry[] = PROOF.map((p, i) => ({
  id: `sample-${i}`,
  slug: p.name.toLowerCase().replace(/\s+/g, "-"),
  name: p.name,
  logoUrl: null,
  website: p.website ?? null,
  initials: p.initials,
  showLogo: true,
  kind: i % 2 === 0 ? "client" : "partner",
  ongoing: i < 2,
  evidenceScore: 3,
}));

const PROFILE = "https://linken.local/c/acme-architecture?src=embed";

function ThemeBlock({ theme, title }: { theme: EmbedTheme; title: string }) {
  const stage = theme === "dark" ? "#081412" : null;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <PreviewStage color={stage} className="flex-col items-stretch gap-6 !p-6">
        <Variant label="verified · essential" width={240}>
          <EmbedVerified profileUrl={PROFILE} theme={theme} />
        </Variant>
        <Variant label="compact · essential" width={480}>
          <EmbedCompact
            name="Acme Architecture"
            verified
            claimed
            confirmedCount={12}
            proofCompanies={PROOF}
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>
        <Variant label="proof-panel · pro" width={520}>
          <EmbedProofPanel
            name="Acme Architecture"
            initials="AA"
            verified
            confirmedCount={12}
            proofCompanies={PROOF}
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>
        <Variant label="trust-card · pro" width={440}>
          <EmbedTrustCard
            name="Acme Architecture"
            level="Trusted"
            breakdown={BREAKDOWN}
            confirmedCount={12}
            proofCompanies={PROOF}
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>
        <Variant label="network-card · pro" width={480}>
          <EmbedNetworkCard
            name="Acme Architecture"
            confirmedCount={12}
            proofCompanies={PROOF}
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>
        <Variant label="credentials · pro" width={400}>
          <EmbedCredentials
            name="Acme Architecture"
            level="Trusted"
            breakdown={BREAKDOWN}
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>
        <Variant label="signature · signature" width={280}>
          <EmbedSignatureSeal
            name="Acme Architecture"
            level="Trusted"
            confirmedCount={12}
            verified
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>
        <Variant label="badge · pro" width={420}>
          <EmbedBadge
            name="Acme Architecture"
            initials="AA"
            verified
            claimed
            confirmedCount={12}
            proofCompanies={PROOF}
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>
        <Variant label="assessment · pro" width={440}>
          <EmbedAssessment
            name="Acme Architecture"
            wouldYes={9}
            wouldTotal={10}
            topStrengths={[
              { label: "Communication", count: 8 },
              { label: "Delivery", count: 7 },
            ]}
            confirmedCount={12}
            proofCompanies={PROOF}
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>
        <Variant label="references · pro" width={460}>
          <EmbedReferences
            name="Acme Architecture"
            totalCount={8}
            references={REFS}
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>
        <Variant label="logo-wall · signature" width={520}>
          <EmbedLogoWall
            ownerName="Acme Architecture"
            ownerProfileUrl={PROFILE}
            entries={WALL}
            label="Trusted by"
            theme={theme}
            mono
            motion="row"
            size="md"
            siteUrl="https://linken.local"
          />
        </Variant>
        <Variant label="logo-wall · pro fallback" width={420}>
          <EmbedLogoWallProFallback
            name="Acme Architecture"
            initials="AA"
            verified
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>
      </PreviewStage>
    </section>
  );
}

function Variant({
  label,
  width,
  children,
}: {
  label: string;
  width: number;
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <p className="mb-2 text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
        {label}
      </p>
      <div style={{ width, maxWidth: "100%" }}>{children}</div>
    </div>
  );
}

export default function DevWidgetsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-24">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#7eb8a4] uppercase">
        Dev only
      </p>
      <h1 className="mt-2 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-medium tracking-[-0.04em] text-ink">
        Embed widgets
      </h1>
      <p className="mt-2 max-w-xl text-[15px] text-ink-soft">
        Essential, Proof, and Signature tiers — sample props, no database.
      </p>
      <div className="mt-10 space-y-12">
        <ThemeBlock theme="light" title="Light" />
        <ThemeBlock theme="dark" title="Dark" />
      </div>
    </main>
  );
}
