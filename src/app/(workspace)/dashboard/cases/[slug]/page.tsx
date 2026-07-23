import { notFound } from "next/navigation";
import { CaseStudyStudio } from "@/components/case-studies/studio/case-study-studio";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { getCaseStudyForDashboard } from "@/features/case-studies/queries";
import { assertCompanyWorkspace } from "@/features/workspace/company-gate";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; saved?: string; sent?: string }>;
};

function flashMessage(q: {
  saved?: string;
  sent?: string;
}): string | null {
  if (q.sent === "1") {
    return "Confirmation email sent. Finish visuals and story, then check Client proof.";
  }
  if (q.saved === "1") return "Saved — preview updated.";
  return null;
}

export default async function DashboardCaseStudioPage({
  params,
  searchParams,
}: Props) {
  const { slug: caseSlug } = await params;
  const q = await searchParams;
  const { user, company, needsCompanySwitch } = await assertCompanyWorkspace();

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Case study studio" />;
  }

  if (!user || !company) notFound();

  const caseStudy = await getCaseStudyForDashboard(company.id, caseSlug);
  if (!caseStudy) notFound();

  const back = `/dashboard/cases/${caseSlug}`;
  const studioKey = `${caseStudy.id}-${caseStudy.coverImageUrl ?? ""}-${caseStudy.galleryUrls.join(",")}`;

  return (
    <CaseStudyStudio
      key={studioKey}
      companySlug={company.slug}
      companyName={company.name}
      caseStudy={caseStudy}
      back={back}
      flash={flashMessage(q)}
      error={q.error}
    />
  );
}
