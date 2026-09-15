import type { Metadata } from "next";
import Link from "next/link";
import { CasesPortfolioGrid } from "@/components/case-studies/cases-portfolio-grid";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
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
    <WorkspacePage
      wide
      title="Case studies"
      description="Each project is a case file — photography, narrative, impact, and the client's confirmation."
      stats={[{ label: "Case files", value: cases.length }]}
      action={
        <>
          <Link href={`/c/${company.slug}#case-studies`}>Public profile</Link>
          <Link href="/dashboard/cases/new">New case file</Link>
        </>
      }
    >
      {error ? (
        <p className="mb-6 rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-[13px] text-ink">
          {error}
        </p>
      ) : null}

      <CasesPortfolioGrid companySlug={company.slug} cases={cases} />
    </WorkspacePage>
  );
}
