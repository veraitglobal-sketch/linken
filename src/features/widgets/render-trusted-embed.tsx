import type { ReactNode } from "react";
import { type EmbedTheme } from "@/components/embed/embed-theme";
import { EmbedLogoWallGrid } from "@/components/embed/embed-logo-wall-grid";
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
import {
  normalizeEmbedVariant,
  resolvePublicEmbedVariant,
} from "@/features/widgets/embed-access";
import { resolveLogoWallPresentation } from "@/features/widgets/logo-wall-background";
import { getLogoWallEntries } from "@/features/widgets/logo-wall";
import { parseWidgetSettings } from "@/features/widgets/settings";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

/** Trusted embed body (owned / internal / unknown / preview). */
export async function renderTrustedEmbed(input: {
  company: Company;
  theme: EmbedTheme;
  variant: string;
  w?: string;
  isPreview: boolean;
}) {
  const { company, theme, variant, w, isPreview } = input;
  const siteUrl = getSiteUrl();
  const profileUrl = `${siteUrl}/c/${company.slug}?src=embed`;

  const entitlements = getEntitlements(company.plan);
  const resolved = resolvePublicEmbedVariant({
    variant,
    premiumEmbeds: entitlements.premiumEmbeds,
    preview: isPreview,
  });

  if (normalizeEmbedVariant(resolved.variant) === "logo-wall") {
    const supabase = await createClient();
    const { data: settingsRow } = await supabase
      .from("companies")
      .select("widget_settings")
      .eq("id", company.id)
      .maybeSingle();
    const background = parseWidgetSettings(settingsRow?.widget_settings).logoWall
      .background;
    const presentation = resolveLogoWallPresentation(background, theme);

    const entries = await getLogoWallEntries(company.id, {
      applySelection: true,
    });
    const node = (
      <>
        <EmbedLogoWallGrid
          ownerProfileUrl={profileUrl}
          entries={entries}
          theme={presentation.theme}
          siteUrl={siteUrl}
        />
        {resolved.locked ? (
          <EmbedProLockedNote
            name={company.name}
            profileUrl={profileUrl}
            theme={presentation.theme}
          />
        ) : null}
      </>
    );
    return wrapEmbed(node, presentation.theme, w, {
      center: false,
      wrapBackground: presentation.wrapBackground,
      bare: presentation.bare,
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

export function wrapEmbed(
  node: ReactNode,
  theme: EmbedTheme,
  w?: string,
  opts?: {
    center?: boolean;
    transparent?: boolean;
    wrapBackground?: string;
    bare?: boolean;
  },
) {
  const width =
    w && (/^\d+$/.test(w) || /^\d+%$/.test(w) || /^\d+px$/.test(w))
      ? /^\d+$/.test(w)
        ? `${w}px`
        : w
      : "100%";

  let bg: string;
  if (opts?.wrapBackground !== undefined) {
    bg = opts.wrapBackground;
  } else if (opts?.transparent || opts?.bare) {
    bg = "transparent";
  } else if (theme === "dark") {
    bg = "#081412";
  } else {
    bg = "transparent";
  }

  return (
    <div
      className={
        opts?.center
          ? "box-border flex min-h-full w-full items-center justify-center"
          : "box-border min-h-full w-full"
      }
      style={{
        width,
        maxWidth: "100%",
        background: bg,
        border: opts?.bare ? "none" : undefined,
      }}
    >
      {node}
    </div>
  );
}
