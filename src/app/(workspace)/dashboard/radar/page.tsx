import type { Metadata } from "next";
import Link from "next/link";
import { RadarLockedPanel } from "@/components/radar/radar-locked-panel";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { assertCompanySection } from "@/features/workspace/company-gate";

export const metadata: Metadata = {
  title: "Radar",
};

/**
 * Radar stays locked until the public graph is dense enough for matching.
 * No lead/search queries while parked.
 */
export default async function DashboardRadarPage() {
  const { user, company, needsCompanySwitch } =
    await assertCompanySection("radar");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Radar" />;
  }

  if (!user) {
    return (
      <WorkspacePage title="Radar" description="Project matching across Hansala.">
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/radar"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to open Radar.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage title="Radar" description="Project matching across Hansala.">
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

  return (
    <WorkspacePage
      title="Radar"
      description="Project matching across the Hansala network."
    >
      <RadarLockedPanel />
    </WorkspacePage>
  );
}
