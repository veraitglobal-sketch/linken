import type { Metadata } from "next";
import Link from "next/link";
import { IntegrationsFlash } from "@/components/integrations/integrations-flash";
import { SchedulingIntegrations } from "@/components/integrations/scheduling-integrations";
import { SlackIntegrations } from "@/components/integrations/slack-integrations";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { getSchedulingForActiveCompany } from "@/features/scheduling/queries";
import { getCompanySlackStatus } from "@/features/slack/queries";
import { assertCompanySection } from "@/features/workspace/company-gate";

export const metadata: Metadata = {
  title: "Integrations",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    connected?: string;
    saved?: string;
    disconnected?: string;
  }>;
};

export default async function DashboardIntegrationsPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const { user, company, needsCompanySwitch } = await assertCompanySection(
    "settings",
    { loginNext: "/dashboard/integrations" },
  );

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Integrations" />;
  }

  if (!user) {
    return (
      <WorkspacePage
        title="Integrations"
        description="Connect booking tools and Slack for your company."
      >
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/integrations"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to manage integrations.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage
        title="Integrations"
        description="Connect booking tools and Slack for your company."
      >
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

  const [scheduling, slack] = await Promise.all([
    getSchedulingForActiveCompany(company.id),
    getCompanySlackStatus(company.id),
  ]);

  return (
    <WorkspacePage
      title="Integrations"
      description="Bookings on your profile, and Slack alerts when something is confirmed."
    >
      <IntegrationsFlash
        error={params.error}
        connected={params.connected}
        saved={params.saved}
        disconnected={params.disconnected}
      />
      <div className="space-y-8">
        <SlackIntegrations slack={slack} />
        <SchedulingIntegrations scheduling={scheduling} />
      </div>
    </WorkspacePage>
  );
}
