import type { Metadata } from "next";
import Link from "next/link";
import { StructureTree } from "@/components/dashboard/structure-tree";
import {
  StructureFlash,
  StructureSectionHead,
  StructureStat,
} from "@/components/dashboard/structure-ui";
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
      <p className="px-5 py-10 text-[14px] text-muted sm:px-8">
        <Link
          href="/login?next=/dashboard/structure"
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          Sign in
        </Link>{" "}
        to manage company structure.
      </p>
    );
  }

  if (!company && !data) {
    return (
      <div className="px-5 py-10 sm:px-8">
        <h1 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
          Register the main company first
        </h1>
        <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-muted">
          Create your firm, then add subsidiaries under it.
        </p>
        <Button href="/onboarding" className="mt-5 h-11">
          Create company
        </Button>
      </div>
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
      description={`${rootName} is the root. Nest subsidiaries, invite firms, and keep ownership clear.`}
      action={
        <Link
          href="/dashboard"
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          Open network map
        </Link>
      }
    >
      <div className="space-y-5">
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

        <WorkspaceCard className="overflow-hidden !p-0">
          <StructureSectionHead
            eyebrow="Ownership"
            title={hasTree ? "Confirmed hierarchy" : "No hierarchy yet"}
            description={
              hasTree
                ? `Nested firms under ${rootName}.`
                : "Create a group and add a subsidiary — the tree appears here."
            }
            tone="soft"
          />
          {hasTree ? (
            <div className="bg-paper/30 px-3 py-3 sm:px-4 sm:py-4">
              <StructureTree
                roots={data!.tree}
                highlightCompanyId={company?.id}
              />
            </div>
          ) : null}
        </WorkspaceCard>

        <DashboardGroupPanel data={data} backPath="/dashboard/structure" />

        <p className="text-[12px] text-muted">
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
