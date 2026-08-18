import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { IntegrationsFlash } from "@/components/integrations/integrations-flash";
import { IntegrationsGrid } from "@/components/integrations/integrations-grid";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { getSchedulingForActiveCompany } from "@/features/scheduling/queries";
import { completeSlackPendingAction } from "@/features/slack/actions";
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
    slack_pending?: string;
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
        description="Bookings and Slack."
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
        description="Bookings and Slack."
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

  if (params.slack_pending === "1") {
    const pending = await completeSlackPendingAction();
    if (pending.ok) {
      redirect("/dashboard/integrations?connected=slack");
    }
    if (!("skip" in pending && pending.skip)) {
      const err =
        "error" in pending && pending.error
          ? pending.error
          : "Could not finish Slack connect.";
      redirect(
        `/dashboard/integrations?error=${encodeURIComponent(err)}`,
      );
    }
  }

  const [scheduling, slack] = await Promise.all([
    getSchedulingForActiveCompany(company.id),
    getCompanySlackStatus(company.id),
  ]);

  return (
    <WorkspacePage
      title="Integrations"
      description="Bookings and Slack."
    >
      <IntegrationsFlash
        error={params.error}
        connected={params.connected}
        saved={params.saved}
        disconnected={params.disconnected}
      />
      <IntegrationsGrid
        companyName={company.name}
        slack={slack}
        scheduling={scheduling}
      />
    </WorkspacePage>
  );
}
