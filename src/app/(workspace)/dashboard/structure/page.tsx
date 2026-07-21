import type { Metadata } from "next";
import Link from "next/link";
import { StructureFlashes } from "@/components/dashboard/structure-flashes";
import { StructureHowItWorks } from "@/components/dashboard/structure-how-it-works";
import { StructureTabs } from "@/components/dashboard/structure-tabs";
import { StructureTreePanel } from "@/components/dashboard/structure-tree-panel";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { DashboardGroupPanel } from "@/components/groups/dashboard-group-panel";
import { SharedOwnershipPanel } from "@/components/groups/shared-ownership-panel";
import { getDashboardSession } from "@/features/dashboard/session";
import {
  getDashboardGroupById,
  getDashboardGroupForCreator,
} from "@/features/groups/dashboard-group";
import { flattenMemberTree } from "@/features/groups/tree";
import {
  getConfirmedCoOwnershipsForGroup,
  getPendingCoOwnerProposals,
} from "@/features/network/co-ownership-queries";
import { PRODUCT } from "@/lib/product-model";

export const metadata: Metadata = {
  title: "Structure",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    created?: string;
    invited?: string;
    subsidiary?: string;
    tab?: string;
  }>;
};

export default async function DashboardStructurePage({ searchParams }: Props) {
  const { error, created, invited, subsidiary, tab: tabRaw } =
    await searchParams;
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
        description="Ownership tree for your group and country branches."
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
        description="Ownership tree for your group and country branches."
      >
        <p className="text-[14px] text-muted">
          <Link
            href="/onboarding"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Create your company
          </Link>{" "}
          first, then build the group tree.
        </p>
      </WorkspacePage>
    );
  }

  const rootName = company?.name ?? data?.group.name ?? "your group";
  const confirmed = data?.confirmed.length ?? 0;
  const pending = data?.pending.length ?? 0;
  const subsidiaries = data?.tree
    ? flattenMemberTree(data.tree).filter((n) => n.depth > 0).length
    : 0;
  const hasTree = Boolean(data?.tree && data.tree.length > 0);
  const hasGroup = Boolean(data);

  let tab: "tree" | "grow" = tabRaw === "grow" ? "grow" : "tree";
  if (!hasGroup) tab = "grow";
  if (hasGroup && !hasTree && tabRaw !== "tree") tab = "grow";

  const [coOwnerProposals, confirmedCoOwnerships] =
    tab === "tree" && hasGroup && company && data
      ? await Promise.all([
          getPendingCoOwnerProposals(company.id),
          getConfirmedCoOwnershipsForGroup(data.group.id),
        ])
      : [[], []];

  return (
    <WorkspacePage
      title={PRODUCT.structure.label}
      description={PRODUCT.structure.job}
      action={
        <Link
          href="/dashboard"
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          {PRODUCT.map.label}
        </Link>
      }
    >
      <div className="space-y-8">
        <StructureFlashes
          error={error}
          created={created}
          invited={invited}
          subsidiary={subsidiary}
        />
        <StructureHowItWorks />
        <StructureTabs
          active={tab}
          hasGroup={hasGroup}
          confirmed={confirmed}
          pending={pending}
        />
        {tab === "tree" ? (
          <>
            <StructureTreePanel
              rootName={rootName}
              groupName={data?.group.name}
              groupSlug={data?.group.slug}
              confirmed={confirmed}
              pending={pending}
              subsidiaries={subsidiaries}
              hasGroup={hasGroup}
              hasTree={hasTree}
              roots={data?.tree ?? []}
              highlightCompanyId={company?.id}
            />
            {hasGroup && data ? (
              <SharedOwnershipPanel
                groupId={data.group.id}
                members={data.confirmed}
                proposals={coOwnerProposals}
                confirmedLinks={confirmedCoOwnerships}
                viewerCompanyId={company?.id ?? null}
                backPath="/dashboard/structure"
              />
            ) : null}
          </>
        ) : (
          <DashboardGroupPanel
            data={data}
            backPath="/dashboard/structure?tab=grow"
            omitMembers
          />
        )}
      </div>
    </WorkspacePage>
  );
}
