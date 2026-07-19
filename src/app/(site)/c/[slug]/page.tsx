import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyProfile } from "@/components/company/company-profile";
import { NetworkMapSection } from "@/components/network/network-map-section";
import { logProfileEvent } from "@/features/analytics/log";
import { parseProfileSource } from "@/features/analytics/sources";
import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { isCompanyOwnerSlug } from "@/features/case-studies/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import { getConfirmedGroupForCompany } from "@/features/groups/queries";
import { getReferencesForCompany } from "@/features/references/queries";
import { getTrustProfile } from "@/features/trust/queries";
import { getCaseStudiesForCompany } from "@/data/mock/case-studies";
import { getPartnersForCompany } from "@/data/mock/partners";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    claimSent?: string;
    claimError?: string;
    claimed?: string;
    refAdded?: string;
    inquirySent?: string;
    error?: string;
    src?: string;
    domainVerified?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  if (!company) return { title: "Company not found" };

  const url = `${getSiteUrl()}/c/${company.slug}`;

  return {
    title: company.name,
    description: company.tagline,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      title: `${company.name} · Linken`,
      description: company.tagline,
      url,
    },
  };
}

export default async function CompanyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { claimSent, claimError, inquirySent, error, src, domainVerified } =
    await searchParams;
  const company = await getCompanyForPage(slug);
  if (!company) notFound();

  const partners = getPartnersForCompany(slug).filter(
    (p) => p.status === "accepted",
  );
  const caseStudies = getCaseStudiesForCompany(slug);
  const [references, trust, assessmentSummary, isOwner, groupBadge] =
    await Promise.all([
      getReferencesForCompany(company.id),
      getTrustProfile(company.id, company.slug),
      getClientAssessmentSummary(company.id),
      company.claimed !== false
        ? isCompanyOwnerSlug(slug)
        : Promise.resolve(false),
      getConfirmedGroupForCompany(company.id),
    ]);
  const editable = isOwner;
  const siteUrl = getSiteUrl();
  const confirmedLinks =
    trust.breakdown.confirmedPartners +
    trust.breakdown.confirmedReferences +
    trust.breakdown.ongoingReferences +
    (groupBadge ? 1 : 0);

  if (!isOwner && company.claimed !== false) {
    const source = parseProfileSource(src);
    await logProfileEvent(
      company.slug,
      source === "qr" ? "qr_scan" : "profile_view",
      source,
    );
  }

  const confirmedClientRels =
    trust.breakdown.confirmedReferences + trust.breakdown.ongoingReferences;
  const networkSuffix =
    trust.level === "Trusted" || trust.level === "Pillar"
      ? ` Verified network: ${trust.breakdown.confirmedPartners} confirmed partners, ${confirmedClientRels} confirmed client relationships.`
      : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    description: `${company.description}${networkSuffix}`,
    url: company.website || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: company.city,
      addressCountry: company.country,
    },
    sameAs: [
      company.website,
      ...partners.map((partner) => `${siteUrl}/c/${partner.slug}`),
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CompanyProfile
        company={company}
        partners={partners}
        caseStudies={caseStudies}
        references={references}
        trust={trust}
        assessmentSummary={assessmentSummary}
        editable={editable}
        claimSent={claimSent === "1"}
        claimError={claimError}
        inquirySent={inquirySent === "1"}
        error={error}
        siteUrl={siteUrl}
        domainVerifiedJustNow={domainVerified === "1"}
        groupBadge={groupBadge}
        networkMap={
          confirmedLinks >= 2 ? (
            <NetworkMapSection
              scope={{ type: "company", slug: company.slug, expand: "full" }}
              title="Network"
              minHeightClass="h-[60vh]"
            />
          ) : null
        }
      />
    </>
  );
}
