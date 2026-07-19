import Link from "next/link";
import { CaseStudyPartners } from "@/components/case-studies/case-study-partners";
import { Button } from "@/components/ui/button";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  caseStudy: CaseStudy;
};

export function CaseStudyDetail({ company, caseStudy }: Props) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href={`/c/${company.slug}`}
        className="text-[13px] font-medium text-muted hover:text-ink"
      >
        ← {company.name}
      </Link>

      <p className="mt-8 text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
        Case study · {caseStudy.year} · {caseStudy.location}
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
        {caseStudy.title}
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
        {caseStudy.summary}
      </p>

      <div className="mt-10 grid gap-8 border-y border-line py-9 sm:grid-cols-2">
        <section>
          <h2 className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
            Challenge
          </h2>
          <p className="mt-3 text-[14px] leading-7 text-ink-soft">
            {caseStudy.challenge}
          </p>
        </section>
        <section>
          <h2 className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
            Outcome
          </h2>
          <p className="mt-3 text-[14px] leading-7 text-ink-soft">
            {caseStudy.outcome}
          </p>
        </section>
      </div>

      <section className="py-9">
        <h2 className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
          Confirmed partners
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Partner roles on this case were confirmed by each company.
        </p>
        <CaseStudyPartners partners={caseStudy.partners} />
      </section>

      <div className="flex flex-wrap gap-2 border-t border-line pt-8">
        <Button href={`/c/${company.slug}`}>Company profile</Button>
        <Button variant="secondary" href="/search">
          Directory
        </Button>
      </div>
    </article>
  );
}
