import { CaseStudyEvidenceBoard } from "@/components/case-studies/studio/case-study-evidence-board";
import type { DossierCompany } from "@/components/case-studies/studio/case-study-evidence-board";
import type { CaseStudy } from "@/types/case-study";

type Props = {
  company: DossierCompany;
  caseStudy: CaseStudy;
  back: string;
  flash?: string | null;
  error?: string | null;
  siteUrl: string;
};

export function CaseStudyStudio(props: Props) {
  return <CaseStudyEvidenceBoard {...props} />;
}
