import type { Metadata } from "next";
import Link from "next/link";
import { CasesPortfolioGrid } from "@/components/case-studies/cases-portfolio-grid";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { Button } from "@/components/ui/button";
import { getCaseStudiesForCompany } from "@/features/case-studies/queries";
import { assertCompanyWorkspace } from "@/features/workspace/company-gate";

export const metadata: Metadata = {
  title: "Case studies",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function DashboardCasesPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const { user, company, needsCompanySwitch } =
    await assertCompanyWorkspace();

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Case studies" />;
  }

  if (!user || !company) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16 text-[14px] text-muted">
        <Link href="/login?next=/dashboard/cases" className="font-semibold text-ink underline">
          Sign in
        </Link>{" "}
        to open your case study studio.
      </div>
    );
  }

  const cases = await getCaseStudiesForCompany(company.id);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
            Evidence board
          </p>
          <h1 className="mt-2 font-display text-[28px] font-medium tracking-[-0.04em] text-ink">
            Case files
          </h1>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-muted">
            Each project is a verified case file — photography, narrative, impact,
            client confirmation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/c/${company.slug}#case-studies`}
            className="inline-flex h-10 items-center rounded-xl border border-line bg-surface px-4 text-[12px] font-semibold text-ink hover:bg-paper"
          >
            Public profile
          </Link>
          <Button href="/dashboard/cases/new" className="h-10 px-4 text-[12px]">
            New case file
          </Button>
        </div>
      </header>

      {error ? (
        <p className="mb-6 rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-[13px] text-ink">
          {error}
        </p>
      ) : null}

      <CasesPortfolioGrid companySlug={company.slug} cases={cases} />
    </div>
  );
}
