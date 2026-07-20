import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { EmbedAssessment } from "@/components/embed/embed-assessment";
import { EmbedBadge } from "@/components/embed/embed-badge";
import type { EmbedProofCompany } from "@/components/embed/embed-brand";
import { EmbedCompact } from "@/components/embed/embed-compact";
import {
  EmbedLogoWall,
  EmbedLogoWallProFallback,
} from "@/components/embed/embed-logo-wall";
import { EmbedReferences } from "@/components/embed/embed-references";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { PreviewStage } from "@/components/widgets/preview-stage";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";

export const dynamic = "force-dynamic";

/** Sample props only — never persisted, never hit by production routes. */
const PROOF: EmbedProofCompany[] = [
  { name: "Nordic Steel", initials: "NS", website: "https://example.com" },
  { name: "Harbor Labs", initials: "HL", website: "https://example.org" },
  { name: "Cascade Digits", initials: "CD" },
  { name: "Vera Transit", initials: "VT" },
  { name: "Oak & Pine", initials: "OP" },
];

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
  {
    clientName: "Cascade Digits",
    service: "HQ workplace",
    period: "since 2024",
    ongoing: true,
    initials: "CD",
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
  evidenceScore: 3 - (i % 3),
}));

const PROFILE = "https://linken.local/c/acme-architecture?src=embed";

function ThemeBlock({
  theme,
  title,
}: {
  theme: EmbedTheme;
  title: string;
}) {
  const stage = theme === "dark" ? "#081412" : null;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <PreviewStage color={stage} className="flex-col items-stretch gap-6 !p-6">
        <Variant label="compact · 48px" width={480}>
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

        <Variant label="badge · 72px" width={420}>
          <EmbedBadge
            name="Acme Architecture"
            initials="AA"
            website="https://example.com"
            verified
            claimed
            confirmedCount={12}
            proofCompanies={PROOF}
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>

        <Variant label="badge · empty proof" width={420}>
          <EmbedBadge
            name="Acme Architecture"
            initials="AA"
            verified
            claimed
            confirmedCount={0}
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>

        <Variant label="assessment · ~120px" width={440}>
          <EmbedAssessment
            name="Acme Architecture"
            wouldYes={9}
            wouldTotal={10}
            topStrengths={[
              { label: "Communication", count: 8 },
              { label: "Delivery", count: 7 },
              { label: "Craft", count: 6 },
            ]}
            confirmedCount={12}
            proofCompanies={PROOF}
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>

        <Variant label="references · ~160px" width={460}>
          <EmbedReferences
            name="Acme Architecture"
            totalCount={8}
            references={REFS}
            profileUrl={PROFILE}
            theme={theme}
          />
        </Variant>

        <Variant label="logo-wall · row" width={520}>
          <EmbedLogoWall
            ownerName="Acme Architecture"
            ownerProfileUrl={PROFILE}
            entries={WALL}
            label="Trusted by brands winning in the network"
            theme={theme}
            mono
            motion="row"
            size="md"
            siteUrl="https://linken.local"
          />
        </Variant>

        <Variant label="logo-wall · vertical" width={280}>
          <EmbedLogoWall
            ownerName="Acme Architecture"
            ownerProfileUrl={PROFILE}
            entries={WALL}
            label="Trusted by"
            theme={theme}
            mono
            motion="stack"
            size="md"
            siteUrl="https://linken.local"
          />
        </Variant>

        <Variant label="logo-wall · grid" width={480}>
          <EmbedLogoWall
            ownerName="Acme Architecture"
            ownerProfileUrl={PROFILE}
            entries={WALL}
            label="Trusted by"
            theme={theme}
            mono
            motion="grid"
            size="sm"
            siteUrl="https://linken.local"
          />
        </Variant>

        <Variant label="logo-wall · pro fallback" width={420}>
          <EmbedLogoWallProFallback
            name="Acme Architecture"
            initials="AA"
            website="https://example.com"
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
        Sample props at the component level — no database, not available in
        production. Use this page to tune the visual identity.
      </p>

      <div className="mt-10 space-y-12">
        <ThemeBlock theme="light" title="Light" />
        <ThemeBlock theme="dark" title="Dark" />
      </div>
    </main>
  );
}
