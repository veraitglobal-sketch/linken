import type { Metadata } from "next";
import Link from "next/link";
import { StructureTree } from "@/components/dashboard/structure-tree";
import {
  WorkspaceCard,
  WorkspacePage,
} from "@/components/dashboard/workspace-page";
import { DashboardGroupPanel } from "@/components/groups/dashboard-group-panel";
import { Button } from "@/components/ui/button";
import { getDashboardSession } from "@/features/dashboard/session";
import {
  getDashboardGroupById,
  getDashboardGroupForCreator,
} from "@/features/groups/dashboard-group";

export const metadata: Metadata = {
  title: "Structure",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    created?: string;
    invited?: string;
    subsidiary?: string;
  }>;
};

export default async function DashboardStructurePage({ searchParams }: Props) {
  const { error, created, invited, subsidiary } = await searchParams;
  const { user, company, group, active } = await getDashboardSession();
  const data = user
    ? active?.type === "group" && group
      ? await getDashboardGroupById(group.id)
      : await getDashboardGroupForCreator()
    : null;

  if (!user) {
    return (
      <p className="py-10 text-[14px] text-ink-soft">
        <Link href="/login?next=/dashboard/structure" className="font-semibold underline">
          Sign in
        </Link>{" "}
        to manage company structure.
      </p>
    );
  }

  if (!company && !data) {
    return (
      <div className="py-10">
        <h1 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
          Register the main company first
        </h1>
        <p className="mt-2 max-w-lg text-[14px] text-ink-soft">
          Create your firm, then add subsidiaries under it. Each branch can grow
          its own sub-companies later.
        </p>
        <Button href="/onboarding" className="mt-5 h-11">
          Create company
        </Button>
      </div>
    );
  }

  const rootName = company?.name ?? data?.group.name ?? "Group";

  return (
    <WorkspacePage
      title="Structure"
      description={`${rootName} is the root. Add subsidiaries, then let branches grow their own. Public trust stays on confirmed evidence only.`}
    >
      <div className="space-y-5">
        {error ? (
          <p className="rounded-xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
            {error}
          </p>
        ) : null}
        {created ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            Group created.
          </p>
        ) : null}
        {invited ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            Invite sent to {invited}. They must confirm.
          </p>
        ) : null}
        {subsidiary ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            Subsidiary created:{" "}
            <Link href={`/c/${subsidiary}`} className="font-semibold underline">
              {subsidiary}
            </Link>
          </p>
        ) : null}

        {data?.tree && data.tree.length > 0 ? (
          <WorkspaceCard>
            <p className="text-[12px] font-medium text-[#64748b]">Live tree</p>
            <h2 className="mt-0.5 text-[16px] font-semibold tracking-[-0.02em] text-ink">
              Confirmed hierarchy
            </h2>
            <div className="mt-4">
              <StructureTree
                roots={data.tree}
                highlightCompanyId={company?.id}
              />
            </div>
          </WorkspaceCard>
        ) : null}

        <DashboardGroupPanel data={data} backPath="/dashboard/structure" />

        <p className="text-[12px] text-[#94a3b8]">
          Prefer the classic group page?{" "}
          <Link
            href="/dashboard/group"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Open company group →
          </Link>
        </p>
      </div>
    </WorkspacePage>
  );
}
