import Link from "next/link";
import { CaseStudyPartners } from "@/components/case-studies/case-study-partners";
import type { CaseStudy } from "@/types/case-study";

type Props = {
  companySlug: string;
  caseStudy: CaseStudy;
};

export function CaseStudyCard({ companySlug, caseStudy }: Props) {
  return (
    <article className="border-b border-line py-7 last:border-b-0">
      <Link
        href={`/c/${companySlug}/case-studies/${caseStudy.slug}`}
        className="group block"
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[12px] font-medium text-muted">{caseStudy.year}</span>
          <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink group-hover:text-accent">
            {caseStudy.title}
          </h3>
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          {caseStudy.summary}
        </p>
        <p className="mt-2 text-[12px] text-muted">
          {caseStudy.location} · {caseStudy.services.join(" · ")}
        </p>
        <span className="mt-3 inline-block text-[13px] font-medium text-accent">
          Open case study
        </span>
      </Link>
      <CaseStudyPartners partners={caseStudy.partners} />
    </article>
  );
}
