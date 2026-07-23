import { CaseStudyAside } from "@/components/case-studies/case-study-aside";
import { CaseStudyGallery } from "@/components/case-studies/case-study-gallery";
import { CaseStudyHero } from "@/components/case-studies/case-study-hero";
import { CaseStudyNarrative } from "@/components/case-studies/case-study-narrative";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  caseStudy: CaseStudy;
  editable?: boolean;
  requested?: boolean;
  error?: string;
  index?: number;
};

export function CaseStudyDetail({
  company,
  caseStudy,
  editable = false,
  requested = false,
  error,
  index = 0,
}: Props) {
  return (
    <div className="pb-20">
      <CaseStudyHero company={company} caseStudy={caseStudy} index={index} />

      <div className="mx-auto max-w-6xl px-4 pt-12">
        {error ? (
          <p className="mb-6 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
            {error}
          </p>
        ) : null}
        {requested ? (
          <p className="mb-6 rounded-2xl border border-[#1a5c51]/30 bg-[#1a5c51]/10 px-4 py-3 text-sm text-ink">
            Confirmation request sent. The client will receive an email with a
            secure link.
          </p>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-12">
          <div className="min-w-0 space-y-12">
            <CaseStudyNarrative
              challenge={caseStudy.challenge}
              outcome={caseStudy.outcome}
              process={caseStudy.process}
            />
            <CaseStudyGallery urls={caseStudy.galleryUrls} title={caseStudy.title} />
          </div>
          <CaseStudyAside
            company={company}
            caseStudy={caseStudy}
            editable={editable}
          />
        </div>
      </div>
    </div>
  );
}
