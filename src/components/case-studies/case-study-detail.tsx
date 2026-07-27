import { CaseStudyDossier } from "@/components/case-studies/dossier/case-study-dossier";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  caseStudy: CaseStudy;
  editable?: boolean;
  requested?: boolean;
  error?: string;
  index?: number;
  companyHref?: string;
  hideCompanyQuote?: boolean;
};

export function CaseStudyDetail(props: Props) {
  return <CaseStudyDossier {...props} />;
}
