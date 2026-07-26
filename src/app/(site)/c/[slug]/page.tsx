import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { CompanyProfile } from "@/components/company/company-profile";
import { NetworkMapSection } from "@/components/network/network-map-section";
import { CompanyMapTeaser } from "@/components/product/company-map-teaser";
import { logProfileEvent } from "@/features/analytics/log";
import { parseProfileSource } from "@/features/analytics/sources";
import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { isCompanyOwnerSlug } from "@/features/case-studies/queries";
import { getActivationChecklist } from "@/features/activation/checklist";
import { getCaseStudiesForCompany } from "@/features/case-studies/queries";
import {
  getCompanyForPage,
  searchCompanies,
} from "@/features/companies/queries";
import { getConfirmedGroupForCompany } from "@/features/groups/queries";
import { getPartnershipInbox } from "@/features/partners/inbox";
import {
  getPartnerRailSettings,
  getPartnersForCompany,
} from "@/features/partners/public-queries";
import { getReferencesForCompany } from "@/features/references/queries";
import { getPublicTeam } from "@/features/team/queries";
import { getTrustProfile } from "@/features/trust/queries";
import { PRODUCT } from "@/lib/product-model";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    claimSent?: string;
    claimError?: string;
    inquirySent?: string;
    error?: string;
    invited?: string;
    created?: string;
    src?: string;
    domainVerified?: string;
    partnerConfirmed?: string;
    add?: string;
    q?: string;
    mode?: string;
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
      title: `${company.name} · Hansala`,
      description: company.tagline,
      url,
    },
  };
}

export default async function CompanyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const company = await getCompanyForPage(slug);
  if (!company) {
    const redirectSlug = await resolveCompanySlugRedirect(slug);
    if (redirectSlug) permanentRedirect(`/c/${redirectSlug}`);
    notFound();
  }

  const [
    partners,
    partnerRail,
    caseStudies,
    references,
    trust,
    assessmentSummary,
    isOwner,
    groupBadge,
    teamMembers,
  ] = await Promise.all([
    getPartnersForCompany(company.id),
    getPartnerRailSettings(company.id),
    getCaseStudiesForCompany(company.id),
    getReferencesForCompany(company.id),
    getTrustProfile(company.id, company.slug),
    getClientAssessmentSummary(company.id),
    company.claimed !== false
      ? isCompanyOwnerSlug(slug)
      : Promise.resolve(false),
    getConfirmedGroupForCompany(company.id),
    getPublicTeam(company.id),
  ]);

  const editable = isOwner;
  const showAdd = editable && sp.add === "1";
  const addMode = sp.mode === "draft" ? "draft" : "search";
  const q = showAdd && addMode === "search" ? (sp.q ?? "").trim() : "";

  const [checklist, inbox, searchHits] = await Promise.all([
    editable ? getActivationChecklist(company.id) : Promise.resolve(null),
    showAdd ? getPartnershipInbox(company.id) : Promise.resolve(null),
    showAdd && q ? searchCompanies(q) : Promise.resolve([]),
  ]);

  const statusBySlug = new Map<string, string>();
  if (inbox) {
    for (const row of inbox.outgoingPending) {
      statusBySlug.set(row.other.slug, "Pending");
    }
    for (const row of inbox.incomingPending) {
      statusBySlug.set(row.other.slug, "Incoming");
    }
    for (const row of inbox.accepted) {
      statusBySlug.set(row.other.slug, "Official");
    }
  }

  const addResults = searchHits.filter((c) => c.slug !== company.slug);
  const siteUrl = getSiteUrl();
  const confirmedLinks =
    trust.breakdown.confirmedPartners +
    trust.breakdown.confirmedReferences +
    trust.breakdown.ongoingReferences +
    (groupBadge ? 1 : 0);

  if (!isOwner && company.claimed !== false) {
    const source = parseProfileSource(sp.src);
    await logProfileEvent(
      company.slug,
      source === "qr" ? "qr_scan" : "profile_view",
      source,
    );
  }

  const networkMap =
    confirmedLinks >= 2 ? (
      <NetworkMapSection
        scope={{ type: "company", slug: company.slug, expand: "full" }}
        title={PRODUCT.map.label}
        minHeightClass="h-[60vh]"
      />
    ) : editable ? (
      <CompanyMapTeaser companySlug={company.slug} />
    ) : null;

  return (
    <>
      <CompanyProfile
        company={company}
        partners={partners}
        partnerRail={partnerRail}
        caseStudies={caseStudies}
        references={references}
        trust={trust}
        assessmentSummary={assessmentSummary}
        editable={editable}
        claimSent={sp.claimSent === "1"}
        claimError={sp.claimError}
        inquirySent={sp.inquirySent === "1"}
        error={sp.error}
        partnerInvited={sp.invited}
        partnerCreated={sp.created}
        siteUrl={siteUrl}
        domainVerifiedJustNow={sp.domainVerified === "1"}
        partnerConfirmedJustNow={sp.partnerConfirmed === "1"}
        groupBadge={groupBadge}
        teamMembers={teamMembers}
        nextActivationStep={checklist?.next ?? null}
        showAddPartner={showAdd}
        addPartnerQ={q}
        addPartnerResults={addResults}
        addPartnerVerified={Boolean(company.verified)}
        addPartnerStatus={statusBySlug}
        addPartnerMode={addMode}
        networkMap={networkMap}
      />
    </>
  );
}
