import {
  embedWrapCenter,
  embedWrapTransparent,
  renderEmbedVariant,
} from "@/components/embed/render-embed-variant";
import { EmbedProLockedNote } from "@/components/embed/embed-pro-locked-note";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { getClientAssessmentSummary } from "@/features/assessments/queries";
import type { Company } from "@/types/company";
import { getEntitlements } from "@/features/plan/entitlements";
import { getReferencesForCompany } from "@/features/references/queries";
import { getTrustProfile } from "@/features/trust/queries";
import {
  normalizeEmbedVariant,
  resolvePublicEmbedVariant,
} from "@/features/widgets/embed-access";
import {
  isPlacementVariant,
  renderPlacementEmbed,
} from "@/features/widgets/render-placement-embed";
import { wrapEmbed } from "@/features/widgets/wrap-embed";
import { getSiteUrl } from "@/lib/site";

/** Trusted embed body (owned / internal / unknown / preview). */
export async function renderTrustedEmbed(input: {
  company: Company;
  theme: EmbedTheme;
  variant: string;
  w?: string;
  isPreview: boolean;
  /** Testimonials only: shape declared by this placement, not by settings. */
  layoutOverride?: string;
  viaHost?: string | null;
}) {
  const { company, theme, variant, w, isPreview, viaHost, layoutOverride } = input;
  const siteUrl = getSiteUrl();
  const profileUrl = `${siteUrl}/c/${company.slug}?src=embed`;

  const entitlements = getEntitlements(company.plan);
  const resolved = resolvePublicEmbedVariant({
    variant,
    premiumEmbeds: entitlements.premiumEmbeds,
    preview: isPreview,
  });

  const normalized = normalizeEmbedVariant(resolved.variant);

  if (isPlacementVariant(normalized)) {
    const [trust] = await Promise.all([
      getTrustProfile(company.id, company.slug),
    ]);
    const confirmedCount =
      trust.breakdown.confirmedPartners +
      trust.breakdown.confirmedReferences +
      trust.breakdown.ongoingReferences;
    return renderPlacementEmbed({
      company,
      theme,
      variant: normalized,
      w,
      resolved,
      viaHost,
      confirmedCount,
      layoutOverride,
    });
  }

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
    })
    .map((r) => ({
      clientName: r.clientName,
      service: r.service,
      startedYear: r.startedYear,
      endedYear: r.endedYear,
      ongoing: r.ongoing,
      disclosure: r.disclosure,
    }));

  const confirmedCount =
    trust.breakdown.confirmedPartners +
    trust.breakdown.confirmedReferences +
    trust.breakdown.ongoingReferences;

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

export { wrapEmbed } from "@/features/widgets/wrap-embed";
