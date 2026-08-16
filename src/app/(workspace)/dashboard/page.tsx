import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HomeBoard } from "@/components/dashboard/home/home-board";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { DashboardGroupPanel } from "@/components/groups/dashboard-group-panel";
import { isSetupDismissed } from "@/features/dashboard/dismiss-setup";
import { loadDashboardHome } from "@/features/dashboard/home-data";
import { getDashboardSession } from "@/features/dashboard/session";
import { getDashboardGroupById } from "@/features/groups/dashboard-group";
import { isDeveloperPartnerKind } from "@/features/workspace/partner-mode";

export const metadata: Metadata = {
  title: "Home",
};

export default async function DashboardHomePage() {
  const { user, company, group, active } = await getDashboardSession();

  if (company && isDeveloperPartnerKind(company.organizationKind)) {
    redirect("/dashboard/developer");
  }

  if (!user) {
    return (
      <WorkspacePage title="Home" description="Your next actions on Hansala.">
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to open your workspace.
        </p>
      </WorkspacePage>
    );
  }

  if (active?.type === "group" && group) {
    const data = await getDashboardGroupById(group.id);
    return (
      <WorkspacePage
        title="Company group"
        description="Manage members, brand, and subsidiaries."
        action={
          <Link
            href="/dashboard/structure"
            className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
          >
            Structure tree
          </Link>
        }
      >
        <DashboardGroupPanel data={data} backPath="/dashboard" />
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage
        title="Home"
        description="Create a company to start collecting verified references."
      >
        <div className="rounded-[24px] border border-line bg-surface px-6 py-8">
          <h2 className="font-display text-xl font-medium text-ink">
            No company yet
          </h2>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
            Activation starts with a company profile, then your first mutual
            confirmation.
          </p>
          <Link
            href="/onboarding"
            className="mt-5 inline-flex h-11 items-center rounded-xl bg-navy px-5 text-[13px] font-semibold text-white"
          >
            Create your company
          </Link>
        </div>
      </WorkspacePage>
    );
  }

  const [model, dismissed] = await Promise.all([
    loadDashboardHome(company),
    isSetupDismissed(),
  ]);

  return (
    <WorkspacePage
      title="Home"
      description="Get your first verified reference — then grow the network."
      action={
        <Link
          href="/dashboard/map"
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          Open map
        </Link>
      }
    >
      <HomeBoard
        companyId={company.id}
        companySlug={company.slug}
        model={model}
        showSetupBanner={!dismissed}
      />
    </WorkspacePage>
  );
}
