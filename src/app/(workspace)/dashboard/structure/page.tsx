import type { Metadata } from "next";
import Link from "next/link";
import { StructureTree } from "@/components/dashboard/structure-tree";
import { StructureFlash, StructureStat } from "@/components/dashboard/structure-ui";
import {
  WorkspaceCard,
  WorkspacePage,
} from "@/components/dashboard/workspace-page";
import { DashboardGroupPanel } from "@/components/groups/dashboard-group-panel";
import { getDashboardSession } from "@/features/dashboard/session";
import {
  getDashboardGroupById,
  getDashboardGroupForCreator,
} from "@/features/groups/dashboard-group";
import { flattenMemberTree } from "@/features/groups/tree";

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
      <WorkspacePage
        title="Structure"
        description="Ownership tree and subsidiaries."
      >
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/structure"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to manage company structure.
        </p>
      </WorkspacePage>
    );
  }

  if (!company && !data) {
    return (
      <WorkspacePage
        title="Structure"
        description="Ownership tree and subsidiaries."
      >
        <p className="text-[14px] text-muted">
          <Link
            href="/onboarding"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Create your company
          </Link>{" "}
          first, then add subsidiaries.
        </p>
      </WorkspacePage>
    );
  }

  const rootName = company?.name ?? data?.group.name ?? "Group";
  const confirmed = data?.confirmed.length ?? 0;
  const pending = data?.pending.length ?? 0;
  const subsidiaries = data?.tree
    ? flattenMemberTree(data.tree).filter((n) => n.depth > 0).length
    : 0;
  const hasTree = Boolean(data?.tree && data.tree.length > 0);

  return (
    <WorkspacePage
      title="Structure"
      description={`${rootName} is the root. Nest subsidiaries and keep ownership clear.`}
      action={
        <Link
          href="/dashboard"
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          Network map
        </Link>
      }
    >
      <div className="space-y-10">
        {error ? <StructureFlash tone="error">{error}</StructureFlash> : null}
        {created ? <StructureFlash>Group created.</StructureFlash> : null}
        {invited ? (
          <StructureFlash>
            Invite sent to {invited}. They must confirm.
          </StructureFlash>
        ) : null}
        {subsidiary ? (
          <StructureFlash>
            Subsidiary created:{" "}
            <Link
              href={`/c/${subsidiary}`}
              className="font-semibold underline-offset-2 hover:underline"
            >
              {subsidiary}
            </Link>
          </StructureFlash>
        ) : null}

        <div className="grid grid-cols-3 gap-2.5">
          <StructureStat label="Confirmed" value={String(confirmed)} />
          <StructureStat label="Pending" value={String(pending)} />
          <StructureStat label="Subsidiaries" value={String(subsidiaries)} />
        </div>

        <section>
          <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
                Hierarchy
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                {hasTree
                  ? `Nested firms under ${rootName}.`
                  : "Create a group and add a subsidiary — the tree appears here."}
              </p>
            </div>
            <Link
              href="/dashboard/group"
              className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
            >
              Company group
            </Link>
          </header>
          <WorkspaceCard padded={false} className="overflow-hidden">
            {hasTree ? (
              <div className="px-3 py-3 sm:px-4 sm:py-4">
                <StructureTree
                  roots={data!.tree}
                  highlightCompanyId={company?.id}
                />
              </div>
            ) : (
              <div className="px-5 py-10 text-center sm:px-6">
                <p className="text-[14px] font-medium text-ink">
                  No hierarchy yet
                </p>
                <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-muted">
                  Add a subsidiary below to start the tree.
                </p>
              </div>
            )}
          </WorkspaceCard>
        </section>

        <DashboardGroupPanel
          data={data}
          backPath="/dashboard/structure"
          omitMembers
        />
      </div>
    </WorkspacePage>
  );
}
