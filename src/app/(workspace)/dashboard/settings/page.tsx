import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import Link from "next/link";
import { assertCompanySection } from "@/features/workspace/company-gate";

export const metadata: Metadata = {
  title: "Company settings",
};

/** Legacy route — profile edit lives on the public profile. */
export default async function DashboardSettingsPage() {
  const { user, company, needsCompanySwitch } =
    await assertCompanySection("settings");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Company settings" />;
  }

  if (!user) {
    return (
      <WorkspacePage title="Company settings">
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/settings"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to edit your company.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    redirect("/onboarding");
  }

  redirect(`/c/${company.slug}/edit`);
}
