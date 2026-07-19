import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import type { EmbedProofCompany } from "@/components/embed/embed-brand";
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
import { parseLogoWallDensity } from "@/features/widgets/catalog";
import {
  getLogoWallEntries,
  logoWallLabelText,
  parseLogoWallLabel,
} from "@/features/widgets/logo-wall";
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
    density?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  return {
    title: company ? `${company.name} · Verified on Linken` : "Linken badge",
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

function wrapEmbed(node: ReactNode, theme: EmbedTheme, w?: string) {
  const width =
    w && (/^\d+$/.test(w) || /^\d+%$/.test(w) || /^\d+px$/.test(w))
      ? /^\d+$/.test(w)
        ? `${w}px`
        : w
      : "100%";
  return (
    <div
      className="box-border min-h-full w-full"
      style={{
        width,
        maxWidth: "100%",
        background: theme === "dark" ? "#0a1714" : "transparent",
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
    density: densityRaw,
  } = await searchParams;
  const theme = parseEmbedTheme(themeRaw);
  const company = await getCompanyForPage(slug);
  if (!company) notFound();

  // Gallery / studio previews must not inflate embed_view analytics.
  if (preview !== "1") {
    await logProfileEvent(company.slug, "embed_view", "embed");
  }

  const siteUrl = getSiteUrl();
  const profileUrl = `${siteUrl}/c/${company.slug}?src=embed`;
  const claimed = company.claimed !== false;
  const isPreview = preview === "1";

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
      );
    }

    const entries = claimed
      ? await getLogoWallEntries(company.id, { applySelection: true })
      : [];
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
      );
    }

    return wrapEmbed(
      <EmbedLogoWall
        ownerName={company.name}
        ownerProfileUrl={profileUrl}
        entries={entries}
        label={logoWallLabelText(parseLogoWallLabel(labelRaw))}
        theme={theme}
        mono={monoRaw === "1"}
        density={parseLogoWallDensity(densityRaw)}
        siteUrl={siteUrl}
      />,
      theme,
      w,
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
    return wrapEmbed(node, theme, w);
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

  const proofCompanies: EmbedProofCompany[] = wallEntries.slice(0, 5).map((e) => ({
    name: e.name,
    initials: e.initials,
    logoUrl: e.logoUrl,
    website: e.website,
  }));

  if (variant === "compact") {
    return wrapEmbed(
      <EmbedCompact
        name={company.name}
        verified={company.verified}
        claimed
        confirmedCount={confirmedCount}
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
