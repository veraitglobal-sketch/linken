import type { ReactNode } from "react";
import {
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import {
  embedWrapCenter,
  embedWrapTransparent,
  renderEmbedVariant,
} from "@/components/embed/render-embed-variant";
import { EmbedProLockedNote } from "@/components/embed/embed-pro-locked-note";
import { getClientAssessmentSummary } from "@/features/assessments/queries";
import type { Company } from "@/types/company";
import { getEntitlements } from "@/features/plan/entitlements";
import { getReferencesForCompany } from "@/features/references/queries";
import { getTrustProfile } from "@/features/trust/queries";
import { resolvePublicEmbedVariant } from "@/features/widgets/embed-access";
import { getSiteUrl } from "@/lib/site";

/** Trusted embed body (owned / internal / unknown / preview). */
export async function renderTrustedEmbed(input: {
  company: Company;
  theme: EmbedTheme;
  variant: string;
  w?: string;
  isPreview: boolean;
}) {
  const { company, theme, variant, w, isPreview } = input;
  const profileUrl = `${getSiteUrl()}/c/${company.slug}?src=embed`;

  const [trust, assessment, references] = await Promise.all([
    getTrustProfile(company.id, company.slug),
    getClientAssessmentSummary(company.id),
    getReferencesForCompany(company.id),
  ]);

  const confirmedRefs = references
    .filter((r) => r.status === "confirmed")
    .sort((a, b) => {
      if (a.ongoing !== b.ongoing) return a.ongoing ? -1 : 1;
      return (a.startedYear || "").localeCompare(b.startedYear || "");
    });

  const confirmedCount =
    trust.breakdown.confirmedPartners +
    trust.breakdown.confirmedReferences +
    trust.breakdown.ongoingReferences;

  const entitlements = getEntitlements(company.plan);
  const resolved = resolvePublicEmbedVariant({
    variant,
    premiumEmbeds: entitlements.premiumEmbeds,
    preview: isPreview,
  });

  const node = (
    <>
      {renderEmbedVariant({
        variant: resolved.variant,
        company,
        theme,
        profileUrl,
        claimed: company.claimed !== false,
        trust,
        assessment,
        confirmedRefs,
        confirmedCount,
      })}
      {resolved.locked ? (
        <EmbedProLockedNote
          name={company.name}
          profileUrl={profileUrl}
          theme={theme}
        />
      ) : null}
    </>
  );

  return wrapEmbed(node, theme, w, {
    center: embedWrapCenter(resolved.variant),
    transparent: embedWrapTransparent(resolved.variant),
  });
}

export function wrapEmbed(
  node: ReactNode,
  theme: EmbedTheme,
  w?: string,
  opts?: { center?: boolean; transparent?: boolean },
) {
  const width =
    w && (/^\d+$/.test(w) || /^\d+%$/.test(w) || /^\d+px$/.test(w))
      ? /^\d+$/.test(w)
        ? `${w}px`
        : w
      : "100%";
  const bg = opts?.transparent
    ? "transparent"
    : theme === "dark"
      ? "#081412"
      : "transparent";
  return (
    <div
      className={
        opts?.center
          ? "box-border flex min-h-full w-full items-center justify-center"
          : "box-border min-h-full w-full"
      }
      style={{ width, maxWidth: "100%", background: bg }}
    >
      {node}
    </div>
  );
}
