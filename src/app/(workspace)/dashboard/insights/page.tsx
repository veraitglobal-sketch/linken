import type { Metadata } from "next";
import { InsightsDashboard } from "@/components/analytics/insights-dashboard";
import { Button } from "@/components/ui/button";
import { getAnalytics } from "@/features/analytics/queries";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { parsePlan } from "@/features/plan/entitlements";
import { assertCompanySection } from "@/features/workspace/company-gate";

export const metadata: Metadata = {
  title: "Insights",
};

export default async function InsightsPage() {
  const { user, company, needsCompanySwitch } = await assertCompanySection("insights");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Insights" />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-ink">
          Sign in to continue
        </h1>
        <Button href="/login?next=/dashboard/insights" className="mt-6 h-11">
          Sign in
        </Button>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-ink">
          Register your company
        </h1>
        <p className="mt-2 max-w-md text-[14px] text-[#5b6472]">
          Insights track visits and inquiries on your public profile.
        </p>
        <Button href="/onboarding" className="mt-6 h-11">
          Create company
        </Button>
      </div>
    );
  }

  const analytics = await getAnalytics(company.id, 30);
  const plan = parsePlan(company.plan);

  return <InsightsDashboard analytics={analytics} plan={plan} />;
}
