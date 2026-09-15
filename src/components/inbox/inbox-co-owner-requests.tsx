import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import { InboxRequestRow } from "@/components/inbox/inbox-request-row";
import {
  confirmCoOwnership,
  declineCoOwnership,
} from "@/features/network/co-ownership";
import type { CoOwnerProposal } from "@/features/network/co-ownership-queries";

export function InboxCoOwnerRequests({
  proposals,
  viewerCompanyId,
}: {
  proposals: CoOwnerProposal[];
  viewerCompanyId: string | null;
}) {
  if (proposals.length === 0) return null;
  return (
    <WorkspaceCard padded={false}>
      <ul className="divide-y divide-line">
        {proposals.map((p) => {
          const iAmCoParent = p.coParentCompanyId === viewerCompanyId;
          const otherName = iAmCoParent ? p.childName : p.coParentName;
          return (
            <InboxRequestRow
              key={p.id}
              text={
                <>
                  <span className="font-semibold">{otherName}</span> proposes
                  shared ownership of{" "}
                  <span className="font-semibold">{p.childName}</span>
                  {iAmCoParent
                    ? " — confirm to open that firm in your workspace."
                    : "."}
                </>
              }
            >
              <form action={confirmCoOwnership}>
                <input type="hidden" name="edge_id" value={p.id} />
                <input
                  type="hidden"
                  name="back"
                  value="/dashboard"
                />
                <Button type="submit" variant="primary" className="h-8 px-3 text-[11px]">
                  Confirm
                </Button>
              </form>
              <form action={declineCoOwnership}>
                <input type="hidden" name="edge_id" value={p.id} />
                <input
                  type="hidden"
                  name="back"
                  value="/dashboard"
                />
                <Button type="submit" variant="secondary" className="h-8 px-3 text-[11px]">
                  Decline
                </Button>
              </form>
            </InboxRequestRow>
          );
        })}
      </ul>
    </WorkspaceCard>
  );
}
