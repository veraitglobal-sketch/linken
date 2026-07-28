import { ClientHighlights } from "@/components/assessments/client-highlights";
import { CaseStudyList } from "@/components/case-studies/case-study-list";
import { CompanyAbout } from "@/components/company/company-about";
import { CompanyTeamSection } from "@/components/company/company-team-section";
import { PartnerSidebar } from "@/components/partners/partner-sidebar";
import { ReferencesSection } from "@/components/references/references-section";
import { ProfileTestimonialsSection } from "@/components/testimonials/profile-testimonials-section";
import { TrustProgressCard } from "@/components/trust/trust-progress-card";
import { TrustWhyCard } from "@/components/trust/trust-why-card";
import type { ClientAssessmentSummary } from "@/features/assessments/queries";
import type { PublicTeamMember } from "@/features/team/types";
import type { TrustProfile } from "@/features/trust/queries";
import {
  PARTNER_RAIL_DEFAULT_LIMIT,
  type PartnerRailSettings,
} from "@/features/partners/partner-rail";
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
  teamMembers: PublicTeamMember[];
  editable: boolean;
  isUnclaimed: boolean;
  showTeam: boolean;
  showRefs: boolean;
  showCases: boolean;
  showPartners: boolean;
  showTestimonials: boolean;
  showWhyPublic: boolean;
  showOwnerProgress: boolean;
  showAddPartner: boolean;
  addPartnerQ: string;
  addPartnerResults: Company[];
  addPartnerVerified: boolean;
  addPartnerStatus?: Map<string, string>;
  addPartnerMode: "search" | "draft";
  caseStudyBase?: string;
};

/** Main profile grid — about column + partners rail. */
export function CompanyProfileBody({
  company,
  partners,
  partnerRail,
  caseStudies,
  references,
  testimonials,
  trust,
  assessmentSummary,
  teamMembers,
  editable,
  isUnclaimed,
  showTeam,
  showRefs,
  showCases,
  showPartners,
  showTestimonials,
  showWhyPublic,
  showOwnerProgress,
  showAddPartner,
  addPartnerQ,
  addPartnerResults,
  addPartnerVerified,
  addPartnerStatus,
  addPartnerMode,
  caseStudyBase,
}: Props) {
  const showSidebar = showWhyPublic || showOwnerProgress || showPartners;

  return (
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
        {showTestimonials ? (
          <ProfileTestimonialsSection
            testimonials={testimonials}
            editable={editable && !isUnclaimed}
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
              rail={
                partnerRail ?? {
                  sortIds: [],
                  limit: PARTNER_RAIL_DEFAULT_LIMIT,
                }
              }
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
  );
}
