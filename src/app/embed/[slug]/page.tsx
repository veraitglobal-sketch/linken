import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  parseEmbedTheme,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import {
  embedWrapCenter,
  embedWrapTransparent,
  renderEmbedVariant,
} from "@/components/embed/render-embed-variant";
import { EmbedProLockedNote } from "@/components/embed/embed-pro-locked-note";
import { logProfileEvent } from "@/features/analytics/log";
import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { getEntitlements } from "@/features/plan/entitlements";
import { getReferencesForCompany } from "@/features/references/queries";
import { getTrustProfile } from "@/features/trust/queries";
import { resolvePublicEmbedVariant } from "@/features/widgets/embed-access";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    variant?: string;
    theme?: string;
    preview?: string;
    w?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  return {
    title: company ? `${company.name} · Verified on Hansala` : "Hansala badge",
    robots: { index: false, follow: true },
  };
}

function wrapEmbed(
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

export default async function EmbedBadgePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { variant = "horizontal", theme: themeRaw, preview, w } =
    await searchParams;
  const theme = parseEmbedTheme(themeRaw);
  const company = await getCompanyForPage(slug);
  if (!company) {
    const redirectSlug = await resolveCompanySlugRedirect(slug);
    if (redirectSlug) {
      const qs = new URLSearchParams();
      if (variant) qs.set("variant", variant);
      if (themeRaw) qs.set("theme", themeRaw);
      if (w) qs.set("w", w);
      const suffix = qs.toString();
      permanentRedirect(`/embed/${redirectSlug}${suffix ? `?${suffix}` : ""}`);
    }
    notFound();
  }

  if (preview !== "1") {
    await logProfileEvent(company.slug, "embed_view", "embed");
  }

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
    preview: preview === "1",
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
