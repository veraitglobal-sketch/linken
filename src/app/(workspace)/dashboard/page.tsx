import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { DashboardGroupPanel } from "@/components/groups/dashboard-group-panel";
import { PendingGroupInvites } from "@/components/groups/pending-group-invites";
import { NetworkMapCanvas } from "@/components/network/network-map-canvas";
import { getDashboardSession } from "@/features/dashboard/session";
import {
  getDashboardGroupById,
  getDashboardGroupForCreator,
} from "@/features/groups/dashboard-group";
import {
  getOwnedGroupMemberships,
  getPendingGroupInvitesForOwner,
  getPendingParentProposalsForOwner,
} from "@/features/groups/queries";
import { resolveWorkspaceGraphScope } from "@/features/network/queries";
import { getPartnershipInbox } from "@/features/partners/inbox";

export const metadata: Metadata = {
  title: "Map",
};

export default async function DashboardOverviewPage() {
  const { user, company, group, active } = await getDashboardSession();

  if (!user) {
    return (
      <WorkspacePage title="Map" description="Who you’re connected to.">
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to open the map.
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
        title="Map"
        description="Who you’re connected to."
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

  const [groupInvites, parentProposals, ownedMemberships, groupData, inbox] =
    await Promise.all([
      getPendingGroupInvitesForOwner(),
      getPendingParentProposalsForOwner(),
      getOwnedGroupMemberships(),
      getDashboardGroupForCreator(),
      getPartnershipInbox(company.id),
    ]);

  const groupSlug =
    groupData?.group.slug ?? ownedMemberships[0]?.groupSlug ?? null;
  const graphScope = await resolveWorkspaceGraphScope({
    companySlug: company.slug,
    groupSlug,
  });

  const showInvites =
    groupInvites.length > 0 || parentProposals.length > 0;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {showInvites ? (
        <div className="absolute top-3 left-1/2 z-30 w-[min(100%-1.5rem,28rem)] -translate-x-1/2">
          <PendingGroupInvites
            invites={groupInvites}
            parentProposals={parentProposals}
          />
        </div>
      ) : null}

      <NetworkMapCanvas
        scope={graphScope}
        fullBleed
        editable
        viewerCompanyId={company.id}
        pendingInviteCount={inbox.outgoingPending.length}
        companySlug={company.slug}
        emptyHref={`/c/${company.slug}?add=1#add-partner`}
        emptyLabel="Add on Company"
        secondaryHref={`/c/${company.slug}`}
        secondaryLabel="Company"
        subtitle={groupSlug ? "Group map" : "Your map"}
      />
    </div>
  );
}
