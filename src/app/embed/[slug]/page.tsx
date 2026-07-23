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
import { logProfileEvent } from "@/features/analytics/log";
import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { getEntitlements } from "@/features/plan/entitlements";
import { getReferencesForCompany } from "@/features/references/queries";
import { getTrustProfile } from "@/features/trust/queries";
import {
  getLogoWallEntries,
  logoWallLabelText,
  parseLogoWallLabel,
} from "@/features/widgets/logo-wall";
import {
  buildProofCompanies,
  PREVIEW_PROOF_COMPANIES,
} from "@/features/widgets/proof-companies";
import {
  parseLogoMotion,
  parseLogoSize,
} from "@/features/widgets/logo-motion";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    variant?: string;
    theme?: string;
    preview?: string;
    w?: string;
    label?: string;
    mono?: string;
    motion?: string;
    size?: string;
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
  const {
    variant = "badge",
    theme: themeRaw,
    preview,
    w,
    label: labelRaw,
    mono: monoRaw,
    motion: motionRaw,
    size: sizeRaw,
  } = await searchParams;
  const theme = parseEmbedTheme(themeRaw);
  const company = await getCompanyForPage(slug);
  if (!company) {
    const redirectSlug = await resolveCompanySlugRedirect(slug);
    if (redirectSlug) {
      const qs = new URLSearchParams();
      if (variant) qs.set("variant", variant);
      if (themeRaw) qs.set("theme", themeRaw);
      if (w) qs.set("w", w);
      if (labelRaw) qs.set("label", labelRaw);
      if (monoRaw) qs.set("mono", monoRaw);
      if (motionRaw) qs.set("motion", motionRaw);
      if (sizeRaw) qs.set("size", sizeRaw);
      const suffix = qs.toString();
      permanentRedirect(`/embed/${redirectSlug}${suffix ? `?${suffix}` : ""}`);
    }
    notFound();
  }

  if (preview !== "1") {
    await logProfileEvent(company.slug, "embed_view", "embed");
  }

  const siteUrl = getSiteUrl();
  const profileUrl = `${siteUrl}/c/${company.slug}?src=embed`;
  const claimed = company.claimed !== false;
  const isPreview = preview === "1";
  const logoMotion = parseLogoMotion(motionRaw);
  const logoSize = parseLogoSize(sizeRaw);
  const logoMono = monoRaw !== "0";
  const canLogoWall =
    getEntitlements(company.plan).logoWallWidget || isPreview;

  const [trust, assessment, references, wallAll] = await Promise.all([
    getTrustProfile(company.id, company.slug),
    getClientAssessmentSummary(company.id),
    getReferencesForCompany(company.id),
    claimed
      ? getLogoWallEntries(company.id, { applySelection: false })
      : Promise.resolve([]),
  ]);

  const wallEntries =
    variant === "logo-wall" && claimed && canLogoWall
      ? await getLogoWallEntries(company.id, { applySelection: true })
      : wallAll;

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

  let proofCompanies = buildProofCompanies({
    wall: wallAll,
    references: confirmedRefs,
    limit: 24,
  });
  if (isPreview && proofCompanies.length === 0) {
    proofCompanies = PREVIEW_PROOF_COMPANIES;
  }

  let entries = wallEntries;
  if (variant === "logo-wall" && entries.length === 0 && isPreview) {
    entries = PREVIEW_PROOF_COMPANIES.map((p, i) => ({
      id: `preview-${i}`,
      slug: p.name.toLowerCase().replace(/\s+/g, "-"),
      name: p.name,
      logoUrl: p.logoUrl ?? null,
      website: p.website ?? null,
      initials: p.initials,
      showLogo: true,
      kind: i % 2 === 0 ? ("client" as const) : ("partner" as const),
      ongoing: i < 2,
      evidenceScore: 3,
    }));
  }

  const node = renderEmbedVariant({
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
    wallEntries: entries,
    logoWallLabel: logoWallLabelText(parseLogoWallLabel(labelRaw)),
    logoMono,
    logoMotion,
    logoSize,
  });

  return wrapEmbed(node, theme, w, {
    center: embedWrapCenter(variant),
    transparent: embedWrapTransparent(variant),
  });
}
