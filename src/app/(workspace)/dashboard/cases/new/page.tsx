import type { Metadata } from "next";
import Link from "next/link";
import { OpenDossierFlow } from "@/components/case-studies/open-dossier-flow";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { assertCompanyWorkspace } from "@/features/workspace/company-gate";

export const metadata: Metadata = {
  title: "Issue dossier",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function DashboardCaseNewPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const { user, company, needsCompanySwitch } = await assertCompanyWorkspace();

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Issue dossier" />;
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
    <OpenDossierFlow
      companySlug={company.slug}
      companyName={company.name}
      error={error}
    />
  );
}
