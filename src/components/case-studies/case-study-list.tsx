import Link from "next/link";
import { CaseStudyCard } from "@/components/case-studies/case-study-card";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  companySlug: string;
  caseStudies: CaseStudy[];
  editable?: boolean;
};

export function CaseStudyList({
  company,
  companySlug,
  caseStudies,
  editable = false,
}: Props) {
  if (caseStudies.length === 0 && !editable) return null;

  return (
    <section id="case-studies" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-0.5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
            Selected work
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.55rem,2.5vw,1.95rem)] font-medium tracking-[-0.035em] text-ink">
            Case files
          </h2>
        </div>
        {editable ? (
          <Link
            href="/dashboard/cases"
            className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Add case study
          </Link>
        ) : null}
      </div>

      {caseStudies.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {caseStudies.map((caseStudy, index) => (
            <CaseStudyCard
              key={caseStudy.id}
              company={company}
              companySlug={companySlug}
              caseStudy={caseStudy}
              index={index}
              featured={index === 0}
            />
          ))}
        </div>
      ) : editable ? (
        <div className="rounded-[24px] border border-dashed border-line bg-surface/80 px-5 py-6">
          <p className="text-[13px] font-semibold text-ink">No case studies yet</p>
          <p className="mt-1.5 text-[13px] text-ink-soft">
            Create one in the dashboard — we email the client for confirmation
            in the same step.
          </p>
          <Link
            href="/dashboard/cases"
            className="mt-3 inline-flex text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Create &amp; send confirmation →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
