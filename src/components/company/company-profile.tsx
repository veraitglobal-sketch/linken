import { CaseStudyList } from "@/components/case-studies/case-study-list";
import { CompanyAbout } from "@/components/company/company-about";
import { CompanyHeroBand } from "@/components/company/company-hero-band";
import { CompanySignal } from "@/components/company/company-signal";
import { UnclaimedBanner } from "@/components/company/unclaimed-banner";
import { InquirySentBanner } from "@/components/inquiries/inquiry-sent-banner";
import { PartnerSidebar } from "@/components/partners/partner-sidebar";
import { ReferencesSection } from "@/components/references/references-section";
import { TrustProgressCard } from "@/components/trust/trust-progress-card";
import { TrustWhyCard } from "@/components/trust/trust-why-card";
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
  editable?: boolean;
  claimSent?: boolean;
  claimError?: string;
  inquirySent?: boolean;
  error?: string;
};

export function CompanyProfile({
  company,
  partners,
  caseStudies,
  references,
  trust,
  editable = false,
  claimSent,
  claimError,
  inquirySent = false,
  error,
}: Props) {
  const isUnclaimed = company.claimed === false;
  const confirmedRefs = references.filter((r) => r.status === "confirmed").length;
  const showPartners = partners.length > 0 || editable;
  const showCases = caseStudies.length > 0 || editable;
  const showRefs = references.length > 0 || editable;
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
      />
      {inquirySent ? <InquirySentBanner companyName={company.name} /> : null}
      {error ? (
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
          {showRefs ? (
            <ReferencesSection references={references} editable={editable} />
          ) : null}
          {showCases ? (
            <CaseStudyList
              companySlug={company.slug}
              caseStudies={caseStudies}
              editable={editable}
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
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
