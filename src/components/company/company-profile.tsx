import { CaseStudyList } from "@/components/case-studies/case-study-list";
import { CompanyAbout } from "@/components/company/company-about";
import { CompanyHeroBand } from "@/components/company/company-hero-band";
import { CompanyIdentity } from "@/components/company/company-identity";
import { PartnerSidebar } from "@/components/partners/partner-sidebar";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";
import type { Partner } from "@/types/partner";

type Props = {
  company: Company;
  partners: Partner[];
  caseStudies: CaseStudy[];
  editable?: boolean;
};

export function CompanyProfile({
  company,
  partners,
  caseStudies,
  editable = false,
}: Props) {
  return (
    <>
      <CompanyHeroBand company={company} />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:py-14">
        <div className="min-w-0">
          <CompanyIdentity company={company} />
          <CompanyAbout company={company} />
          <CaseStudyList companySlug={company.slug} caseStudies={caseStudies} />
        </div>
        <PartnerSidebar
          companySlug={company.slug}
          partners={partners}
          editable={editable}
        />
      </div>
    </>
  );
}
