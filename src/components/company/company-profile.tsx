import type { ReactNode } from "react";
import { NextStepStrip } from "@/components/activation/next-step-strip";
import { CompanyProfileBody } from "@/components/company/company-profile-body";
import { ProfileHeader, type ProfileTab } from "@/components/company/profile-header";
import { ProfileProvenance } from "@/components/company/profile-provenance";
import { UnclaimedBanner } from "@/components/company/unclaimed-banner";
import type { PublicTeamMember } from "@/features/team/types";
import { InquirySentBanner } from "@/components/inquiries/inquiry-sent-banner";
import { ProfilePartnerFlashes } from "@/components/partners/profile-partner-flashes";
import { OwnerLoopBar } from "@/components/product/owner-loop-bar";
import type { ActivationStep } from "@/features/activation/checklist";
import type { ClientAssessmentSummary } from "@/features/assessments/queries";
import type { ConfirmedGroupBadge } from "@/features/groups/types";
import type { PartnerRailSettings } from "@/features/partners/partner-rail";
import type { TrustProfile } from "@/features/trust/queries";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";
import type { Partner } from "@/types/partner";
import type { ServiceReference } from "@/types/service-reference";
import type { PublicTestimonial } from "@/features/testimonials/types";

type Props = {
  company: Company;
  partners: Partner[];
  partnerRail?: PartnerRailSettings;
  caseStudies: CaseStudy[];
  references: ServiceReference[];
  providers?: ServiceReference[];
  testimonials: PublicTestimonial[];
  trust: TrustProfile;
  assessmentSummary: ClientAssessmentSummary;
  editable?: boolean;
  claimSent?: boolean;
  claimError?: string;
  inquirySent?: boolean;
  error?: string;
  partnerInvited?: string;
  partnerCreated?: string;
  siteUrl?: string;
  groupBadge?: ConfirmedGroupBadge | null;
  networkMap?: ReactNode;
  domainVerifiedJustNow?: boolean;
  teamMembers?: PublicTeamMember[];
  nextActivationStep?: ActivationStep | null;
  showAddPartner?: boolean;
  addPartnerQ?: string;
  addPartnerResults?: Company[];
  addPartnerVerified?: boolean;
  addPartnerStatus?: Map<string, string>;
  addPartnerMode?: "search" | "draft";
  caseStudyBase?: string;
};

export function CompanyProfile({
  company,
  partners,
  partnerRail,
  caseStudies,
  references,
  providers = [],
  testimonials,
  trust,
  assessmentSummary,
  editable = false,
  claimSent,
  claimError,
  inquirySent = false,
  error,
  partnerInvited,
  partnerCreated,
  siteUrl = "",
  groupBadge = null,
  networkMap = null,
  domainVerifiedJustNow = false,
  teamMembers = [],
  nextActivationStep = null,
  showAddPartner = false,
  addPartnerQ = "",
  addPartnerResults = [],
  addPartnerVerified = false,
  addPartnerStatus,
  addPartnerMode = "search",
  caseStudyBase,
}: Props) {
  const isUnclaimed = company.claimed === false;
  const confirmedRefs = references.filter((r) => r.status === "confirmed").length;

  const showTeam = teamMembers.length > 0 || (editable && !isUnclaimed);
  const showRefs = references.length > 0 || editable;
  const showCases = caseStudies.length > 0 || editable;
  const showPartners = partners.length > 0 || editable;
  const showTestimonials = testimonials.length > 0 || (editable && !isUnclaimed);
  const showMap = networkMap !== null;

  const tabs: ProfileTab[] = [
    { href: "#overview", label: "Overview" },
    showTeam ? { href: "#team", label: "Team" } : null,
    showRefs ? { href: "#references", label: "References" } : null,
    showCases ? { href: "#case-studies", label: "Case studies" } : null,
    showTestimonials ? { href: "#testimonials", label: "Testimonials" } : null,
    showPartners ? { href: "#partners", label: "Partners" } : null,
    showMap ? { href: "#network-map", label: "Map" } : null,
  ].filter(Boolean) as ProfileTab[];

  const flash =
    "rounded-2xl bg-lime-soft px-4 py-3 text-[14px] text-ink ring-1 ring-lime";

  return (
    /* Wash ground, white record cards on it — the profile reads as one
       product surface rather than a marketing page stacked from bands. */
    <div className="bg-wash pb-16">
      <ProfileHeader
        company={company}
        trust={trust}
        counts={{
          partners: partners.length,
          clients: confirmedRefs,
          caseStudies: caseStudies.length,
        }}
        tabs={tabs}
        showContact={!isUnclaimed}
        showOnePager={editable && !isUnclaimed}
        showEmbed={editable && !isUnclaimed}
        showEditProfile={editable && !isUnclaimed}
        siteUrl={siteUrl}
        groupBadge={groupBadge}
      />
      {editable && !isUnclaimed ? (
        <OwnerLoopBar companySlug={company.slug} active="company" />
      ) : null}
      {editable && !isUnclaimed && nextActivationStep ? (
        <NextStepStrip step={nextActivationStep} />
      ) : null}
      {inquirySent ? <InquirySentBanner companyName={company.name} /> : null}
      {domainVerifiedJustNow ? (
        <div className="mx-auto mt-4 max-w-[1280px] px-4 sm:px-[18px]">
          <p className={flash}>
            Domain verified — your email matches your website. The Verified badge
            is live on this profile.
          </p>
        </div>
      ) : null}
      {editable ? (
        <ProfilePartnerFlashes
          companySlug={company.slug}
          error={error}
          invited={partnerInvited}
          created={partnerCreated}
        />
      ) : error ? (
        <div className="mx-auto mt-4 max-w-[1280px] px-4 sm:px-[18px]">
          <p className="rounded-2xl bg-surface px-4 py-3 text-[14px] text-ink ring-1 ring-line">
            {error}
          </p>
        </div>
      ) : null}
      {isUnclaimed ? (
        <UnclaimedBanner
          company={company}
          claimSent={claimSent}
          claimError={claimError}
        />
      ) : null}

      <CompanyProfileBody
        company={company}
        partners={partners}
        partnerRail={partnerRail}
        caseStudies={caseStudies}
        references={references}
        providers={providers}
        testimonials={testimonials}
        trust={trust}
        assessmentSummary={assessmentSummary}
        teamMembers={teamMembers}
        editable={editable}
        isUnclaimed={isUnclaimed}
        showTeam={showTeam}
        showRefs={showRefs}
        showProviders={providers.length > 0}
        showCases={showCases}
        showPartners={showPartners}
        showTestimonials={showTestimonials}
        showWhyPublic={trust.points > 0}
        showOwnerProgress={editable && !isUnclaimed}
        showAddPartner={showAddPartner}
        addPartnerQ={addPartnerQ}
        addPartnerResults={addPartnerResults}
        addPartnerVerified={addPartnerVerified}
        addPartnerStatus={addPartnerStatus}
        addPartnerMode={addPartnerMode}
        caseStudyBase={caseStudyBase}
      />

      <ProfileProvenance company={company} editable={editable} />

      {networkMap}
    </div>
  );
}
