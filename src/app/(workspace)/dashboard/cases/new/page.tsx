import type { Metadata } from "next";
import Link from "next/link";
import { CaseStudyCreateStudio } from "@/components/case-studies/case-study-create-studio";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { assertCompanyWorkspace } from "@/features/workspace/company-gate";

export const metadata: Metadata = {
  title: "New case study",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function DashboardCaseNewPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const { user, company, needsCompanySwitch } = await assertCompanyWorkspace();

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="New case study" />;
  }

  if (!user || !company) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16 text-[14px] text-muted">
        <Link href="/login?next=/dashboard/cases/new" className="font-semibold text-ink underline">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8">
      <header className="mb-8">
        <Link
          href="/dashboard/cases"
          className="text-[12px] font-semibold text-muted hover:text-ink"
        >
          ← Portfolio
        </Link>
        <p className="mt-3 text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
          New project
        </p>
        <h1 className="mt-2 font-display text-[28px] font-medium tracking-[-0.04em] text-ink">
          Name it, then open the studio
        </h1>
        <p className="mt-2 max-w-lg text-[14px] text-muted">
          Two fields to start — then the full studio for photos, story, and client
          confirmation.
        </p>
      </header>

      {error ? (
        <p className="mb-6 rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-[13px] text-ink">
          {error}
        </p>
      ) : null}

      <CaseStudyCreateStudio companySlug={company.slug} />
    </div>
  );
}
