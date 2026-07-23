import type { ReactNode } from "react";
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
import type { ClientAssessmentSummary } from "@/features/assessments/queries";
import type { Company } from "@/types/company";
import type { TrustProfile } from "@/features/trust/queries";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import type { LogoMotion, LogoSize } from "@/features/widgets/logo-motion";

type ReferenceRow = {
  clientName: string;
  service: string;
  startedYear: string;
  endedYear: string | null;
  ongoing: boolean;
  clientLogoUrl?: string | null;
  clientWebsite?: string | null;
};

export type EmbedRenderInput = {
  variant: string;
  company: Company;
  theme: EmbedTheme;
  profileUrl: string;
  siteUrl: string;
  claimed: boolean;
  isPreview: boolean;
  canLogoWall: boolean;
  trust: TrustProfile;
  assessment: ClientAssessmentSummary;
  confirmedRefs: ReferenceRow[];
  proofCompanies: EmbedProofCompany[];
  confirmedCount: number;
  wallEntries: LogoWallEntry[];
  logoWallLabel: string | null;
  logoMono: boolean;
  logoMotion: LogoMotion;
  logoSize: LogoSize;
};

function periodLabel(ref: ReferenceRow) {
  if (ref.ongoing) return `since ${ref.startedYear || "—"}`;
  if (ref.endedYear) return `${ref.startedYear || "—"}–${ref.endedYear}`;
  return ref.startedYear || "—";
}

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function renderEmbedVariant(input: EmbedRenderInput): ReactNode {
  const {
    variant,
    company,
    theme,
    profileUrl,
    siteUrl,
    claimed,
    isPreview,
    canLogoWall,
    trust,
    assessment,
    confirmedRefs,
    proofCompanies,
    confirmedCount,
    wallEntries,
    logoWallLabel,
    logoMono,
    logoMotion,
    logoSize,
  } = input;

  if (variant === "verified") {
    return <EmbedVerified profileUrl={profileUrl} theme={theme} />;
  }

  if (variant === "logo-wall") {
    if (!canLogoWall) {
      return (
        <EmbedLogoWallProFallback
          name={company.name}
          initials={company.logoInitials}
          logoUrl={company.logoUrl}
          website={company.website}
          verified={company.verified}
          profileUrl={profileUrl}
          theme={theme}
        />
      );
    }
    if (wallEntries.length === 0) {
      return (
        <EmbedCompact
          name={company.name}
          verified={company.verified}
          claimed={claimed}
          confirmedCount={confirmedCount}
          profileUrl={profileUrl}
          theme={theme}
        />
      );
    }
    return (
      <EmbedLogoWall
        ownerName={company.name}
        ownerProfileUrl={profileUrl}
        entries={wallEntries}
        label={logoWallLabel}
        theme={theme}
        mono={logoMono}
        motion={logoMotion}
        size={logoSize}
        siteUrl={siteUrl}
      />
    );
  }

  if (!claimed) {
    if (variant === "compact") {
      return (
        <EmbedCompact
          name={company.name}
          verified={false}
          claimed={false}
          confirmedCount={0}
          profileUrl={profileUrl}
          theme={theme}
        />
      );
    }
    return (
      <EmbedBadge
        name={company.name}
        initials={company.logoInitials}
        logoUrl={company.logoUrl}
        website={company.website}
        verified={false}
        claimed={false}
        confirmedCount={0}
        profileUrl={profileUrl}
        theme={theme}
      />
    );
  }

  if (variant === "compact") {
    return (
      <EmbedCompact
        name={company.name}
        verified={company.verified}
        claimed
        confirmedCount={confirmedCount}
        proofCompanies={proofCompanies}
        profileUrl={profileUrl}
        theme={theme}
      />
    );
  }

  if (variant === "proof-panel") {
    return (
      <EmbedProofPanel
        name={company.name}
        initials={company.logoInitials}
        logoUrl={company.logoUrl}
        website={company.website}
        verified={company.verified}
        confirmedCount={confirmedCount}
        proofCompanies={proofCompanies}
        profileUrl={profileUrl}
        theme={theme}
      />
    );
  }

  if (variant === "trust-card") {
    return (
      <EmbedTrustCard
        name={company.name}
        level={trust.level}
        breakdown={trust.breakdown}
        confirmedCount={confirmedCount}
        proofCompanies={proofCompanies}
        profileUrl={profileUrl}
        theme={theme}
      />
    );
  }

  if (variant === "network-card") {
    return (
      <EmbedNetworkCard
        name={company.name}
        confirmedCount={confirmedCount}
        proofCompanies={proofCompanies}
        profileUrl={profileUrl}
        theme={theme}
      />
    );
  }

  if (variant === "credentials") {
    return (
      <EmbedCredentials
        name={company.name}
        level={trust.level}
        breakdown={trust.breakdown}
        profileUrl={profileUrl}
        theme={theme}
      />
    );
  }

  if (variant === "signature") {
    return (
      <EmbedSignatureSeal
        name={company.name}
        level={trust.level}
        confirmedCount={confirmedCount}
        verified={company.verified}
        profileUrl={profileUrl}
        theme={theme}
      />
    );
  }

  if (variant === "assessment" && assessment.wouldWorkAgainTotal >= 3) {
    return (
      <EmbedAssessment
        name={company.name}
        wouldYes={assessment.wouldWorkAgainYes}
        wouldTotal={assessment.wouldWorkAgainTotal}
        topStrengths={assessment.topStrengths.slice(0, 3)}
        confirmedCount={confirmedCount}
        proofCompanies={proofCompanies}
        profileUrl={profileUrl}
        theme={theme}
      />
    );
  }

  if (variant === "references" && confirmedRefs.length > 0) {
    return (
      <EmbedReferences
        name={company.name}
        totalCount={confirmedRefs.length}
        references={confirmedRefs.slice(0, 5).map((r) => ({
          clientName: r.clientName,
          service: r.service,
          period: periodLabel(r),
          ongoing: r.ongoing,
          initials: initialsFrom(r.clientName),
          logoUrl: r.clientLogoUrl,
          website: r.clientWebsite,
        }))}
        profileUrl={profileUrl}
        theme={theme}
      />
    );
  }

  return (
    <EmbedBadge
      name={company.name}
      initials={company.logoInitials}
      logoUrl={company.logoUrl}
      website={company.website}
      verified={company.verified}
      claimed
      confirmedCount={confirmedCount}
      proofCompanies={proofCompanies}
      profileUrl={profileUrl}
      theme={theme}
    />
  );
}

export function embedWrapCenter(variant: string): boolean {
  return variant === "verified" || variant === "compact" || variant === "signature";
}

export function embedWrapTransparent(variant: string): boolean {
  return variant === "verified" || variant === "logo-wall";
}
