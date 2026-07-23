import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyEditForm } from "@/components/case-studies/case-study-edit-form";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { getCaseStudyForDashboard } from "@/features/case-studies/queries";
import { assertCompanyWorkspace } from "@/features/workspace/company-gate";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; saved?: string; sent?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit · ${slug}` };
}

export default async function DashboardCaseEditPage({ params, searchParams }: Props) {
  const { slug: caseSlug } = await params;
  const { error, saved, sent } = await searchParams;
  const { user, company, needsCompanySwitch } = await assertCompanyWorkspace();

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Edit case study" />;
  }

  if (!user || !company) {
    return (
      <WorkspacePage title="Edit case study">
        <p className="text-[14px] text-muted">
          <Link href="/login" className="font-semibold text-ink underline-offset-2 hover:underline">
            Sign in
          </Link>{" "}
          to edit case studies.
        </p>
      </WorkspacePage>
    );
  }

  const caseStudy = await getCaseStudyForDashboard(company.id, caseSlug);
  if (!caseStudy) notFound();

  const back = `/dashboard/cases/${caseSlug}`;

  return (
    <WorkspacePage
      title={caseStudy.title}
      description="Cover, gallery, and story — make this case study portfolio-ready."
      action={
        <Link
          href="/dashboard/cases"
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          All cases
        </Link>
      }
    >
      {error ? (
        <p className="mb-6 rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-[13px] text-ink">
          {error}
        </p>
      ) : null}
      {sent === "1" ? (
        <p className="mb-6 rounded-2xl border border-[#1a5c51]/30 bg-[#1a5c51]/10 px-4 py-3 text-[13px] text-ink">
          Confirmation email sent. Upload a cover photo and gallery below to
          finish the public page.
        </p>
      ) : null}
      {saved === "1" ? (
        <p className="mb-6 rounded-2xl border border-line bg-surface px-4 py-3 text-[13px] text-ink">
          Saved.{" "}
          <Link
            href={`/c/${company.slug}/case-studies/${caseStudy.slug}`}
            className="font-semibold underline-offset-2 hover:underline"
          >
            View public page →
          </Link>
        </p>
      ) : null}

      <CaseStudyEditForm
        companySlug={company.slug}
        caseStudy={caseStudy}
        back={back}
      />
    </WorkspacePage>
  );
}
