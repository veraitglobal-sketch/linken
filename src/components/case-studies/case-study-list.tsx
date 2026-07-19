import { CaseStudyCard } from "@/components/case-studies/case-study-card";
import type { CaseStudy } from "@/types/case-study";

type Props = {
  companySlug: string;
  caseStudies: CaseStudy[];
};

export function CaseStudyList({ companySlug, caseStudies }: Props) {
  return (
    <section className="grid gap-6 py-9 md:grid-cols-[160px_minmax(0,1fr)]">
      <div>
        <h2 className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
          Case studies
        </h2>
        <p className="mt-3 hidden text-[12px] leading-relaxed text-muted md:block">
          Delivered work with partner attribution.
        </p>
      </div>
      <div>
        {caseStudies.length === 0 ? (
          <p className="py-4 text-sm text-muted">No case studies published yet.</p>
        ) : (
          caseStudies.map((caseStudy) => (
            <CaseStudyCard
              key={caseStudy.id}
              companySlug={companySlug}
              caseStudy={caseStudy}
            />
          ))
        )}
      </div>
    </section>
  );
}
