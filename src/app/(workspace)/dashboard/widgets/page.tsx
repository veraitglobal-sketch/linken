import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WidgetAnalyticsSection } from "@/components/widgets/widget-analytics-section";
import { WidgetsStudio } from "@/components/widgets/widgets-studio";
import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { getEntitlements, parsePlan } from "@/features/plan/entitlements";
import { getReferencesForCompany } from "@/features/references/queries";
import { assertCompanySection } from "@/features/workspace/company-gate";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Widgets",
};

export default async function DashboardWidgetsPage() {
  const { user, company, needsCompanySwitch } =
    await assertCompanySection("widgets");
  const siteUrl = getSiteUrl();

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Widgets" />;
  }

  if (!user) {
    return (
      <WorkspacePage title="Widgets" description="Embed Hansala on your website.">
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/widgets"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to configure website widgets.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage title="Widgets" description="Embed Hansala on your website.">
        <p className="text-[14px] text-muted">
          <Link
            href="/onboarding"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Create your company
          </Link>{" "}
          first.
        </p>
      </WorkspacePage>
    );
  }

  const [assessment, references] = await Promise.all([
    getClientAssessmentSummary(company.id),
    getReferencesForCompany(company.id),
  ]);

  const confirmedRefs = references.filter((r) => r.status === "confirmed");
  const isPro = getEntitlements(company.plan).premiumEmbeds;
  const hasProof = confirmedRefs.length > 0;
  const domainReady = Boolean(company.verified && company.website?.trim());

  const availability = {
    verified: true,
    micro: true,
    horizontal: true,
    starter: true,
    score: hasProof,
    "trust-card": true,
    credentials: true,
    signature: true,
    references: confirmedRefs.length > 0,
    assessment: assessment.wouldWorkAgainTotal >= 3,
  };

  return (
    <WorkspacePage
      title="Widgets"
      description="Logo-free embeds — proof strip and confirmed counts only."
      wide
      action={
        <Link
          href={`/c/${company.slug}`}
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          Public profile
        </Link>
      }
    >
      <WidgetAnalyticsSection
        companyId={company.id}
        website={company.website}
        plan={parsePlan(company.plan)}
      />
      <WidgetsStudio
        siteUrl={siteUrl}
        slug={company.slug}
        isPro={isPro}
        domainReady={domainReady}
        availability={availability}
      />
    </WorkspacePage>
  );
}
