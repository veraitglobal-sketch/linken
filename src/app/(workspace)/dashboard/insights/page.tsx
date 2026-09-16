import type { Metadata } from "next";
import Link from "next/link";
import { InsightsDashboard } from "@/components/analytics/insights-dashboard";
import { NetworkDigestOptIn } from "@/components/analytics/network-digest-opt-in";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { getAnalytics } from "@/features/analytics/queries";
import { parsePlan } from "@/features/plan/entitlements";
import { assertCompanySection } from "@/features/workspace/company-gate";
import { createClient } from "@/lib/supabase/server";

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
      <WorkspacePage title="Insights" description="Unique profile visits and inquiries.">
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
      <WorkspacePage title="Insights" description="Unique profile visits and inquiries.">
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
  const supabase = await createClient();
  const { data: digestRow } = await supabase
    .from("companies")
    .select("network_digest_opt_in")
    .eq("id", company.id)
    .maybeSingle();
  const digestOptIn = Boolean(digestRow?.network_digest_opt_in);

  return (
    <div className="space-y-4">
      <NetworkDigestOptIn companyId={company.id} optedIn={digestOptIn} />
      <InsightsDashboard analytics={analytics} plan={plan} />
    </div>
  );
}
