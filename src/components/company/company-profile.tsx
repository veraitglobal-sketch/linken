import { CaseStudyList } from "@/components/case-studies/case-study-list";
import { CompanyAbout } from "@/components/company/company-about";
import { CompanyHeroBand } from "@/components/company/company-hero-band";
import { CompanySignal } from "@/components/company/company-signal";
import { UnclaimedBanner } from "@/components/company/unclaimed-banner";
import { PartnerSidebar } from "@/components/partners/partner-sidebar";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";
import type { Partner } from "@/types/partner";

type Props = {
  company: Company;
  partners: Partner[];
  caseStudies: CaseStudy[];
  editable?: boolean;
  claimSent?: boolean;
  claimError?: string;
};

export function CompanyProfile({
  company,
  partners,
  caseStudies,
  editable = false,
  claimSent,
  claimError,
}: Props) {
  const isUnclaimed = company.claimed === false;

  return (
    <div className="pb-10">
      <CompanyHeroBand company={company} />
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
          city={company.city}
          category={company.category}
        />
      )}

      <div className="mx-auto mt-4 grid max-w-6xl gap-4 px-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5">
        <CompanyAbout company={company} />

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <PartnerSidebar
            companySlug={company.slug}
            partners={partners}
            editable={editable && !isUnclaimed}
          />
        </div>

        <CaseStudyList companySlug={company.slug} caseStudies={caseStudies} />
      </div>
    </div>
  );
}
