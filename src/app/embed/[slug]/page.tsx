import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmbedAssessment } from "@/components/embed/embed-assessment";
import { EmbedBadge } from "@/components/embed/embed-badge";
import { EmbedReferences } from "@/components/embed/embed-references";
import { logProfileEvent } from "@/features/analytics/log";
import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import { getReferencesForCompany } from "@/features/references/queries";
import { getTrustProfile } from "@/features/trust/queries";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
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

export default async function EmbedBadgePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { variant = "badge" } = await searchParams;
  const company = await getCompanyForPage(slug);
  if (!company) notFound();

  await logProfileEvent(company.slug, "embed_view", "embed");

  const siteUrl = getSiteUrl();
  const profileUrl = `${siteUrl}/c/${company.slug}?src=embed`;
  const claimed = company.claimed !== false;

  if (!claimed) {
    return (
      <EmbedBadge
        name={company.name}
        initials={company.logoInitials}
        verified={false}
        claimed={false}
        partnerCount={0}
        caseStudyCount={0}
        profileUrl={profileUrl}
      />
    );
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
    });

  const partnerCount = trust.breakdown.confirmedPartners;
  const caseStudyCount =
    trust.breakdown.clientConfirmedCaseStudies +
    trust.breakdown.partnerConfirmedCaseStudies;

  if (
    variant === "assessment" &&
    assessment.wouldWorkAgainTotal >= 3
  ) {
    return (
      <EmbedAssessment
        name={company.name}
        wouldYes={assessment.wouldWorkAgainYes}
        wouldTotal={assessment.wouldWorkAgainTotal}
        topStrengths={assessment.topStrengths.slice(0, 3)}
        profileUrl={profileUrl}
      />
    );
  }

  if (variant === "references" && confirmedRefs.length > 0) {
    return (
      <EmbedReferences
        name={company.name}
        references={confirmedRefs.slice(0, 5).map((r) => ({
          clientName: r.clientName,
          service: r.service,
          period: periodLabel(r),
        }))}
        profileUrl={profileUrl}
      />
    );
  }

  // badge (default) — also fallback when assessment/references lack data
  return (
    <EmbedBadge
      name={company.name}
      initials={company.logoInitials}
      verified={company.verified}
      claimed
      partnerCount={partnerCount}
      caseStudyCount={caseStudyCount}
      profileUrl={profileUrl}
    />
  );
}
