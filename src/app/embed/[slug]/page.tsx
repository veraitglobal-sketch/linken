import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { EmbedAssessment } from "@/components/embed/embed-assessment";
import { EmbedBadge } from "@/components/embed/embed-badge";
import { EmbedCompact } from "@/components/embed/embed-compact";
import {
  EmbedLogoWall,
  EmbedLogoWallProFallback,
} from "@/components/embed/embed-logo-wall";
import { EmbedReferences } from "@/components/embed/embed-references";
import {
  parseEmbedTheme,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { logProfileEvent } from "@/features/analytics/log";
import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import { getEntitlements } from "@/features/plan/entitlements";
import { getReferencesForCompany } from "@/features/references/queries";
import { getTrustProfile } from "@/features/trust/queries";
import {
  parseLogoMotion,
  parseLogoSize,
} from "@/features/widgets/logo-motion";
import {
  getLogoWallEntries,
  logoWallLabelText,
  parseLogoWallLabel,
  type LogoWallEntry,
} from "@/features/widgets/logo-wall";
import {
  buildProofCompanies,
  PREVIEW_PROOF_COMPANIES,
} from "@/features/widgets/proof-companies";
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

function previewWallEntries(): LogoWallEntry[] {
  return PREVIEW_PROOF_COMPANIES.map((p, i) => ({
    id: `preview-${i}`,
    slug: p.name.toLowerCase().replace(/\s+/g, "-"),
    name: p.name,
    logoUrl: p.logoUrl ?? null,
    website: p.website ?? null,
    initials: p.initials,
    showLogo: true,
    kind: i % 2 === 0 ? "client" : "partner",
    ongoing: i < 2,
    evidenceScore: 3,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  return {
    title: company ? `${company.name} · Verified on Hansala` : "Hansala badge",
    robots: { index: false, follow: true },
  };
}

function periodLabel(ref: {
  ongoing: boolean;
  startedYear: string;
  endedYear: string | null;
}) {
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
      style={{
        width,
        maxWidth: "100%",
        background: bg,
      }}
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

  // Gallery / studio previews must not inflate embed_view analytics.
  if (preview !== "1") {
    await logProfileEvent(company.slug, "embed_view", "embed");
  }

  const siteUrl = getSiteUrl();
  const profileUrl = `${siteUrl}/c/${company.slug}?src=embed`;
  const claimed = company.claimed !== false;
  const isPreview = preview === "1";
  const logoMotion = parseLogoMotion(motionRaw);
  const logoSize = parseLogoSize(sizeRaw);
  // Clean walls default to mono; `mono=0` turns color back on.
  const logoMono = monoRaw !== "0";

  if (variant === "logo-wall") {
    const entitlements = getEntitlements(company.plan);
    const canUse = entitlements.logoWallWidget || isPreview;

    if (!canUse) {
      return wrapEmbed(
        <EmbedLogoWallProFallback
          name={company.name}
          initials={company.logoInitials}
          logoUrl={company.logoUrl}
          website={company.website}
          verified={company.verified}
          profileUrl={profileUrl}
          theme={theme}
        />,
        theme,
        w,
        { transparent: true },
      );
    }

    let entries = claimed
      ? await getLogoWallEntries(company.id, { applySelection: true })
      : [];
    if (entries.length === 0 && isPreview) {
      entries = previewWallEntries();
    }
    if (entries.length === 0) {
      return wrapEmbed(
        <EmbedCompact
          name={company.name}
          verified={company.verified}
          claimed={claimed}
          confirmedCount={0}
          profileUrl={profileUrl}
          theme={theme}
        />,
        theme,
        w,
        { center: true },
      );
    }

    return wrapEmbed(
      <EmbedLogoWall
        ownerName={company.name}
        ownerProfileUrl={profileUrl}
        entries={entries}
        label={logoWallLabelText(parseLogoWallLabel(labelRaw))}
        theme={theme}
        mono={logoMono}
        motion={logoMotion}
        size={logoSize}
        siteUrl={siteUrl}
      />,
      theme,
      w,
      { transparent: true },
    );
  }

  if (!claimed) {
    const node =
      variant === "compact" ? (
        <EmbedCompact
          name={company.name}
          verified={false}
          claimed={false}
          confirmedCount={0}
          profileUrl={profileUrl}
          theme={theme}
        />
      ) : (
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
    return wrapEmbed(node, theme, w, { center: variant === "compact" });
  }

  const [trust, assessment, references, wallEntries] = await Promise.all([
    getTrustProfile(company.id, company.slug),
    getClientAssessmentSummary(company.id),
    getReferencesForCompany(company.id),
    getLogoWallEntries(company.id, { applySelection: false }),
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

  let proofCompanies = buildProofCompanies({
    wall: wallEntries,
    references: confirmedRefs,
    limit: 24,
  });
  // Studio preview: show the motion even before real partners exist.
  if (isPreview && proofCompanies.length === 0) {
    proofCompanies = PREVIEW_PROOF_COMPANIES;
  }

  if (variant === "compact") {
    return wrapEmbed(
      <EmbedCompact
        name={company.name}
        verified={company.verified}
        claimed
        confirmedCount={confirmedCount}
        proofCompanies={proofCompanies}
        profileUrl={profileUrl}
        theme={theme}
      />,
      theme,
      w,
    );
  }

  if (variant === "assessment" && assessment.wouldWorkAgainTotal >= 3) {
    return wrapEmbed(
      <EmbedAssessment
        name={company.name}
        wouldYes={assessment.wouldWorkAgainYes}
        wouldTotal={assessment.wouldWorkAgainTotal}
        topStrengths={assessment.topStrengths.slice(0, 3)}
        confirmedCount={confirmedCount}
        proofCompanies={proofCompanies}
        profileUrl={profileUrl}
        theme={theme}
      />,
      theme,
      w,
    );
  }

  if (variant === "references" && confirmedRefs.length > 0) {
    return wrapEmbed(
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
      />,
      theme,
      w,
    );
  }

  return wrapEmbed(
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
    />,
    theme,
    w,
  );
}
