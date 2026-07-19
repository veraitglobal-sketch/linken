import { CaseStudyCard } from "@/components/case-studies/case-study-card";
import type { CaseStudy } from "@/types/case-study";

type Props = {
  companySlug: string;
  caseStudies: CaseStudy[];
};

export function CaseStudyList({ companySlug, caseStudies }: Props) {
  return (
    <section>
      <div className="mb-4 px-0.5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
          Case studies
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.55rem,2.5vw,1.95rem)] font-medium tracking-[-0.035em] text-ink">
          Delivered with
          <span className="text-ink/35"> confirmed partners.</span>
        </h2>
      </div>

      {caseStudies.length === 0 ? (
        <div className="rounded-[24px] border border-line bg-surface px-5 py-10 text-sm text-muted">
          No case studies published yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {caseStudies.map((caseStudy, index) => (
            <CaseStudyCard
              key={caseStudy.id}
              companySlug={companySlug}
              caseStudy={caseStudy}
              index={index}
              featured={index === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
