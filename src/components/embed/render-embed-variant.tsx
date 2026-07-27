import type { ReactNode } from "react";
import { EmbedAssessment } from "@/components/embed/embed-assessment";
import { EmbedCredentials } from "@/components/embed/embed-credentials";
import { EmbedHorizontal } from "@/components/embed/embed-horizontal";
import { EmbedMicro } from "@/components/embed/embed-micro";
import { embedReferencesNode } from "@/components/embed/embed-references-node";
import { EmbedScoreBar } from "@/components/embed/embed-score-bar";
import { EmbedSignatureSeal } from "@/components/embed/embed-signature-seal";
import { EmbedStarter } from "@/components/embed/embed-starter";
import { EmbedTrustCard } from "@/components/embed/embed-trust-card";
import { EmbedVerified } from "@/components/embed/embed-verified";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { ClientAssessmentSummary } from "@/features/assessments/queries";
import type { TrustProfile } from "@/features/trust/queries";
import type { Company } from "@/types/company";

type ReferenceRow = {
  clientName: string;
  service: string;
  startedYear: string;
  endedYear: string | null;
  ongoing: boolean;
  disclosure?: "named" | "undisclosed" | null;
};

export type EmbedRenderInput = {
  variant: string;
  company: Company;
  theme: EmbedTheme;
  profileUrl: string;
  claimed: boolean;
  trust: TrustProfile;
  assessment: ClientAssessmentSummary;
  confirmedRefs: ReferenceRow[];
  confirmedCount: number;
};

/** Legacy embed params map to current variants. */
function normalizeVariant(raw: string): string {
  const map: Record<string, string> = {
    compact: "micro",
    badge: "horizontal",
    "proof-panel": "horizontal",
    "network-card": "score",
  };
  return map[raw] ?? raw;
}

export function renderEmbedVariant(input: EmbedRenderInput): ReactNode {
  const variant = normalizeVariant(input.variant);
  const {
    company,
    theme,
    profileUrl,
    claimed,
    trust,
    assessment,
    confirmedRefs,
    confirmedCount,
  } = input;

  const base = {
    name: company.name,
    verified: company.verified,
    level: trust.level,
    confirmedCount,
    profileUrl,
    theme,
  };

  if (variant === "verified") {
    return <EmbedVerified profileUrl={profileUrl} theme={theme} />;
  }

  if (!claimed) {
    return (
      <EmbedMicro
        {...base}
        claimed={false}
        verified={false}
      />
    );
  }

  if (variant === "micro") {
    return <EmbedMicro {...base} claimed />;
  }

  if (variant === "horizontal") {
    return <EmbedHorizontal {...base} />;
  }

  if (variant === "starter") {
    return <EmbedStarter {...base} />;
  }

  if (variant === "score") {
    return <EmbedScoreBar {...base} />;
  }

  if (variant === "trust-card") {
    return (
      <EmbedTrustCard
        name={company.name}
        level={trust.level}
        confirmedCount={confirmedCount}
        breakdown={trust.breakdown}
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
    return <EmbedSignatureSeal {...base} />;
  }

  if (variant === "assessment" && assessment.wouldWorkAgainTotal >= 3) {
    return (
      <EmbedAssessment
        name={company.name}
        wouldYes={assessment.wouldWorkAgainYes}
        wouldTotal={assessment.wouldWorkAgainTotal}
        topStrengths={assessment.topStrengths.slice(0, 3)}
        confirmedCount={confirmedCount}
        profileUrl={profileUrl}
        theme={theme}
      />
    );
  }

  if (variant === "references" && confirmedRefs.length > 0) {
    return embedReferencesNode({
      companyName: company.name,
      confirmedRefs,
      profileUrl,
      theme,
    });
  }

  return <EmbedHorizontal {...base} />;
}

export function embedWrapCenter(variant: string): boolean {
  const v = normalizeVariant(variant);
  return v === "verified" || v === "signature";
}

export function embedWrapTransparent(variant: string): boolean {
  const v = normalizeVariant(variant);
  return (
    v === "verified" ||
    v === "logo-wall" ||
    v === "footer-strip" ||
    v === "partners-rotate" ||
    v === "case-gallery" ||
    v === "testimonials"
  );
}
