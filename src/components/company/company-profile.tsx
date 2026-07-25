import type { ReactNode } from "react";
import { NextStepStrip } from "@/components/activation/next-step-strip";
import { ClientHighlights } from "@/components/assessments/client-highlights";
import { CaseStudyList } from "@/components/case-studies/case-study-list";
import { CompanyAbout } from "@/components/company/company-about";
import { CompanyHeroBand } from "@/components/company/company-hero-band";
import { CompanySignal } from "@/components/company/company-signal";
import { CompanyTeamSection } from "@/components/company/company-team-section";
import { UnclaimedBanner } from "@/components/company/unclaimed-banner";
import type { PublicTeamMember } from "@/features/team/types";
import { InquirySentBanner } from "@/components/inquiries/inquiry-sent-banner";
import { PartnerSidebar } from "@/components/partners/partner-sidebar";
import { ProfilePartnerFlashes } from "@/components/partners/profile-partner-flashes";
import { OwnerLoopBar } from "@/components/product/owner-loop-bar";
import { ReferencesSection } from "@/components/references/references-section";
import { TrustProgressCard } from "@/components/trust/trust-progress-card";
import { TrustWhyCard } from "@/components/trust/trust-why-card";
import type { ActivationStep } from "@/features/activation/checklist";
import type { ClientAssessmentSummary } from "@/features/assessments/queries";
import type { ConfirmedGroupBadge } from "@/features/groups/types";
import type { TrustProfile } from "@/features/trust/queries";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";
import type { Partner } from "@/types/partner";
import type { ServiceReference } from "@/types/service-reference";

type Props = {
  company: Company;
  partners: Partner[];
  caseStudies: CaseStudy[];
  references: ServiceReference[];
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
  /** Case study URL base — default `/c/{slug}`. */
  caseStudyBase?: string;
};

export function CompanyProfile({
  company,
  partners,
  caseStudies,
  references,
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
  const showPartners = partners.length > 0 || editable;
  const showCases = caseStudies.length > 0 || editable;
  const showRefs = references.length > 0 || editable;
  const showTeam = teamMembers.length > 0 || (editable && !isUnclaimed);
  const showWhyPublic = trust.points > 0;
  const showOwnerProgress = editable && !isUnclaimed;
  const showSidebar =
    showWhyPublic || showOwnerProgress || showPartners;

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

      <div className="mx-auto mt-4 grid max-w-6xl gap-4 px-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5">
        <div className="flex flex-col gap-4">
          <CompanyAbout company={company} />
          {showTeam ? (
            <CompanyTeamSection
              members={teamMembers}
              companySlug={company.slug}
              editable={editable && !isUnclaimed}
            />
          ) : null}
          <ClientHighlights summary={assessmentSummary} />
          {showRefs ? (
            <ReferencesSection
              references={references}
              editable={editable}
              companySlug={company.slug}
            />
          ) : null}
          {showCases ? (
            <CaseStudyList
              company={company}
              companySlug={company.slug}
              caseStudies={caseStudies}
              editable={editable}
              caseStudyBase={caseStudyBase}
            />
          ) : null}
        </div>

        {showSidebar ? (
          <div className="flex flex-col gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            {showWhyPublic ? <TrustWhyCard trust={trust} /> : null}
            {showOwnerProgress ? <TrustProgressCard trust={trust} /> : null}
            {showPartners ? (
              <PartnerSidebar
                companySlug={company.slug}
                partners={partners}
                editable={editable && !isUnclaimed}
                showAdd={showAddPartner}
                addQ={addPartnerQ}
                addResults={addPartnerResults}
                verified={addPartnerVerified}
                statusBySlug={addPartnerStatus}
                addMode={addPartnerMode}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {networkMap}
    </div>
  );
}
