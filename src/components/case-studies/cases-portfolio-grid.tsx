import Link from "next/link";
import { CasesPortfolioCard } from "@/components/case-studies/cases-portfolio-card";
import { Button } from "@/components/ui/button";
import type { CaseStudy } from "@/types/case-study";

type Props = {
  companySlug: string;
  companyVerified: boolean;
  cases: CaseStudy[];
};

export function CasesPortfolioGrid({ companySlug, companyVerified, cases }: Props) {
  if (cases.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface px-6 py-14 text-center shadow-[0_14px_48px_rgba(8,20,18,0.05)] sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-soft/15 blur-3xl" />
        <p className="relative text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
          Portfolio
        </p>
        <h2 className="relative mt-3 font-display text-3xl font-medium tracking-[-0.04em] text-ink">
          Your first case study
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Cover photo, gallery, and full story — then ask the client to confirm.
          That&apos;s what makes people want to work with you.
        </p>
        <div className="relative mt-8">
          <Button href="/dashboard/cases/new" className="h-12 px-6">
            Start a case study
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cases.map((c, i) => (
        <CasesPortfolioCard
          key={c.id}
          companySlug={companySlug}
          company={{ verified: companyVerified, name: "" }}
          caseStudy={c}
          index={i}
        />
      ))}
      <Link
        href="/dashboard/cases/new"
        className="flex min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-line bg-paper/50 px-6 text-center transition-colors hover:border-blue/35 hover:bg-surface"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-xl text-muted">
          +
        </span>
        <p className="mt-4 font-display text-lg font-medium tracking-[-0.03em] text-ink">
          New case study
        </p>
        <p className="mt-1 text-[13px] text-muted">Photos first, story second</p>
      </Link>
    </div>
  );
}
