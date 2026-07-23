import type { Metadata } from "next";
import Link from "next/link";
import { CaseStudyCreateForm } from "@/components/case-studies/case-study-create-form";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import {
  WorkspaceCard,
  WorkspacePage,
} from "@/components/dashboard/workspace-page";
import { getCaseStudiesForCompany } from "@/features/case-studies/queries";
import { assertCompanyWorkspace } from "@/features/workspace/company-gate";
import { PRODUCT } from "@/lib/product-model";

export const metadata: Metadata = {
  title: "Case studies",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    sent?: string;
    created?: string;
  }>;
};

export default async function DashboardCasesPage({ searchParams }: Props) {
  const { error, sent, created } = await searchParams;
  const { user, company, needsCompanySwitch } =
    await assertCompanyWorkspace();

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Case studies" />;
  }

  if (!user || !company) {
    return (
      <WorkspacePage title="Case studies">
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/cases"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to add case studies.
        </p>
      </WorkspacePage>
    );
  }

  const cases = await getCaseStudiesForCompany(company.id);

  return (
    <WorkspacePage
      title="Case studies"
      description="Portfolio pieces with verified client confirmation — cover photo, gallery, and full story."
      action={
        <Link
          href={`/c/${company.slug}#case-studies`}
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          {PRODUCT.company.label}
        </Link>
      }
    >
      <div className="space-y-8">
        {error ? (
          <p className="rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-[13px] text-ink">
            {error}
          </p>
        ) : null}
        {sent === "1" && created ? (
          <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-[13px] text-ink">
            Case created. Add cover and gallery photos next.{" "}
            <Link
              href={`/dashboard/cases/${created}`}
              className="font-semibold underline-offset-2 hover:underline"
            >
              Open editor →
            </Link>
          </p>
        ) : null}

        <section>
          <header className="mb-3">
            <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
              New case study
            </h2>
            <p className="mt-1 text-[12px] text-muted">
              Write the story first — then upload photos on the edit page.
            </p>
          </header>
          <CaseStudyCreateForm companySlug={company.slug} />
        </section>

        <section>
          <header className="mb-3">
            <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
              Your portfolio
            </h2>
          </header>
          <WorkspaceCard padded={false}>
            {cases.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-muted">
                None yet — create one above.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {cases.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/dashboard/cases/${c.slug}`}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-paper"
                    >
                      <span className="min-w-0 truncate text-[13px] font-semibold text-ink">
                        {c.title}
                      </span>
                      <span className="shrink-0 text-[12px] text-muted">
                        Edit →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </WorkspaceCard>
        </section>
      </div>
    </WorkspacePage>
  );
}
