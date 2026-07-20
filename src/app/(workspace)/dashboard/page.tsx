import type { Metadata } from "next";
import { DashboardGroupPanel } from "@/components/groups/dashboard-group-panel";
import { PendingGroupInvites } from "@/components/groups/pending-group-invites";
import { NetworkMapCanvas } from "@/components/network/network-map-canvas";
import { Button } from "@/components/ui/button";
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
  title: "Network graph",
};

export default async function DashboardOverviewPage() {
  const { user, company, group, active } = await getDashboardSession();

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-ink">
          Sign in to continue
        </h1>
        <Button href="/login?next=/dashboard" className="mt-6 h-11">
          Sign in
        </Button>
      </div>
    );
  }

  if (active?.type === "group" && group) {
    const data = await getDashboardGroupById(group.id);
    return (
      <div className="mx-auto max-w-3xl space-y-2 px-4 py-8 sm:px-6">
        <DashboardGroupPanel data={data} backPath="/dashboard" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-ink">
          Register your company
        </h1>
        <p className="mt-2 max-w-md text-[14px] text-[#5b6472]">
          Then build the network graph — connect subsidiaries and partners by
          dragging.
        </p>
        <Button href="/onboarding" className="mt-6 h-11">
          Create company
        </Button>
      </div>
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
        emptyHref="/dashboard/structure"
        emptyLabel="Add first subsidiary"
        subtitle={groupSlug ? "Company network" : "Your network"}
      />
    </div>
  );
}
