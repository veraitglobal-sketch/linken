import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ProfileViewBeacon } from "@/components/analytics/profile-view-beacon";
import { CompanyProfile } from "@/components/company/company-profile";
import { CompanyProfileNetworkSlot } from "@/components/company/company-profile-network-slot";
import { RelationshipConfirmBanner } from "@/components/company/relationship-confirm-banner";
import { NetworkMapSection } from "@/components/network/network-map-section";
import { CommonPartnersSlot } from "@/components/partners/common-partners-slot";
import { PostPartnershipPromo } from "@/components/partners/post-partnership-promo";
import { CompanyMapTeaser } from "@/components/product/company-map-teaser";
import { CompanyPageLd } from "@/components/seo/company-page-ld";
import { loadPublicCompanyProfile } from "@/features/companies/load-public-profile";
import { getCompanyForPage } from "@/features/companies/queries";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { getPartnersForCompany } from "@/features/partners/public-queries";
import { buildCompanyMetadata } from "@/features/seo/company-metadata";
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
    via?: string;
    rel?: string;
    domainVerified?: string;
    partnerConfirmed?: string;
    add?: string;
    q?: string;
    mode?: string;
    with?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  if (!company) {
    return {
      title: "Company not found",
      robots: { index: false, follow: false },
    };
  }
  const partners =
    company.claimed === false
      ? []
      : await getPartnersForCompany(company.id);
  return buildCompanyMetadata({
    name: company.name,
    slug: company.slug,
    tagline: company.tagline,
    description: company.description,
    city: company.city,
    country: company.country,
    category: company.category,
    claimed: company.claimed,
    verified: company.verified,
    siteUrl: getSiteUrl(),
    partnerNames: partners.map((p) => p.name),
  });
}

export default async function CompanyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const data = await loadPublicCompanyProfile(slug, sp);
  if (!data) {
    const redirectSlug = await resolveCompanySlugRedirect(slug);
    if (redirectSlug) permanentRedirect(`/c/${redirectSlug}`);
    notFound();
  }

  const {
    company,
    editable,
    showAdd,
    addMode,
    q,
    partners,
    partnerRail,
    caseStudies,
    references,
    providers,
    trust,
    assessmentSummary,
    groupBadge,
    teamMembers,
    relationship,
    testimonials,
    checklist,
    addResults,
    statusBySlug,
  } = data;

  const siteUrl = getSiteUrl();
  const confirmedLinks =
    trust.breakdown.confirmedPartners +
    trust.breakdown.confirmedReferences +
    trust.breakdown.ongoingReferences +
    (groupBadge ? 1 : 0);

  if (!editable && company.claimed !== false) {
    const viaHost = (sp.via ?? "").trim().toLowerCase().slice(0, 253);
    if (viaHost && relationship) {
      const { recordWidgetPlacementThrottled } = await import(
        "@/features/widgets/record-placement"
      );
      await recordWidgetPlacementThrottled({
        companyId: relationship.other.id,
        host: viaHost,
        variant: "logo-wall",
      });
    }
  }

  const mapTeaser = editable ? (
    <CompanyMapTeaser companySlug={company.slug} />
  ) : null;
  const networkMap =
    confirmedLinks >= 2 ? (
      <NetworkMapSection
        scope={{ type: "company", slug: company.slug, expand: "full" }}
        title={PRODUCT.map.label}
        minHeightClass="h-[60vh]"
        empty={mapTeaser}
        inset
      />
    ) : (
      mapTeaser
    );

  return (
    <>
      {!editable && company.claimed !== false ? (
        <ProfileViewBeacon slug={company.slug} src={sp.src} />
      ) : null}
      <CompanyPageLd company={company} partners={partners} siteUrl={siteUrl} />
      {relationship ? (
        <RelationshipConfirmBanner
          profileName={company.name}
          profileSlug={company.slug}
          relationship={relationship}
        />
      ) : null}
      <CommonPartnersSlot companyId={company.id} theirs={partners} />
      {sp.partnerConfirmed === "1" ? (
        <PostPartnershipPromo
          companySlug={company.slug}
          companyName={company.name}
          siteUrl={siteUrl}
          partnerSlug={sp.with ?? null}
        />
      ) : null}
      <CompanyProfile
        company={company}
        partners={partners}
        partnerRail={partnerRail}
        caseStudies={caseStudies}
        references={references}
        providers={providers}
        testimonials={testimonials}
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
      {company.claimed !== false ? (
        <CompanyProfileNetworkSlot
          companySlug={company.slug}
          companyName={company.name}
          partners={partners}
        />
      ) : null}
    </>
  );
}
