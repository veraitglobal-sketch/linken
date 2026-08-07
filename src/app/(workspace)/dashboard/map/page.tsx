import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { PendingGroupInvites } from "@/components/groups/pending-group-invites";
import { NetworkMapCanvas } from "@/components/network/network-map-canvas";
import { getDashboardSession } from "@/features/dashboard/session";
import {
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

/** Network map — moved off /dashboard so Home can prioritize activation. */
export default async function DashboardMapPage() {
  const { user, company } = await getDashboardSession();

  if (!user) {
    return (
      <WorkspacePage title="Map" description="Who you’re connected to.">
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/map"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to open the map.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage title="Map" description="Who you’re connected to.">
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
        emptyLabel="Add partners on Company"
        subtitle={groupSlug ? "Group map" : "Your map"}
      />
    </div>
  );
}
