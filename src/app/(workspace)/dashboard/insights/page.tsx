import type { Metadata } from "next";
import Link from "next/link";
import { InsightsDashboard } from "@/components/analytics/insights-dashboard";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { getAnalytics } from "@/features/analytics/queries";
import { parsePlan } from "@/features/plan/entitlements";
import { assertCompanySection } from "@/features/workspace/company-gate";

export const metadata: Metadata = {
  title: "Insights",
};

export default async function InsightsPage() {
  const { user, company, needsCompanySwitch } =
    await assertCompanySection("insights");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Insights" />;
  }

  if (!user) {
    return (
      <WorkspacePage title="Insights" description="Profile visits and inquiries.">
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/insights"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to view insights.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage title="Insights" description="Profile visits and inquiries.">
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

  const analytics = await getAnalytics(company.id, 30);
  const plan = parsePlan(company.plan);

  return <InsightsDashboard analytics={analytics} plan={plan} />;
}
