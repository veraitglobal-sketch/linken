import type { ReactNode } from "react";
import { NextStepStrip } from "@/components/activation/next-step-strip";
import { CompanyHeroBand } from "@/components/company/company-hero-band";
import { CompanyProfileBody } from "@/components/company/company-profile-body";
import { CompanySignal } from "@/components/company/company-signal";
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
  partnerConfirmedJustNow?: boolean;
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
  partnerConfirmedJustNow = false,
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

  return (
    <div className="pb-10">
      <CompanyHeroBand
        company={company}
        trustLevel={trust.level}
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
        <div className="mx-auto mt-4 max-w-6xl px-4">
          <p className="rounded-2xl border border-[#1a5c51]/30 bg-[#1a5c51]/10 px-4 py-3 text-sm text-ink">
            Domain verified — your email matches your website. The Verified badge
            is live on this profile.
          </p>
        </div>
      ) : null}
      {partnerConfirmedJustNow ? (
        <div className="mx-auto mt-4 max-w-6xl px-4">
          <p className="rounded-2xl border border-[#1a5c51]/30 bg-[#1a5c51]/10 px-4 py-3 text-sm text-ink">
            Partnership confirmed. Your company is claimed and the link is live
            on the map.
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
        <div className="mx-auto mt-4 max-w-6xl px-4">
          <p className="rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
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
      ) : (
        <CompanySignal
          partnerCount={partners.length}
          caseStudyCount={caseStudies.length}
          referenceCount={confirmedRefs}
          city={company.city}
          category={company.category}
        />
      )}

      <CompanyProfileBody
        company={company}
        partners={partners}
        partnerRail={partnerRail}
        caseStudies={caseStudies}
        references={references}
        testimonials={testimonials}
        trust={trust}
        assessmentSummary={assessmentSummary}
        teamMembers={teamMembers}
        editable={editable}
        isUnclaimed={isUnclaimed}
        showTeam={teamMembers.length > 0 || (editable && !isUnclaimed)}
        showRefs={references.length > 0 || editable}
        showCases={caseStudies.length > 0 || editable}
        showPartners={partners.length > 0 || editable}
        showTestimonials={testimonials.length > 0 || (editable && !isUnclaimed)}
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

      {networkMap}
    </div>
  );
}
