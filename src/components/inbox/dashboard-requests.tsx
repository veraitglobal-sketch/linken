import Link from "next/link";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import { confirmCaseStudyPartnerRole } from "@/features/case-studies/actions";
import type { PendingCaseStudyConfirmation } from "@/features/case-studies/pending-confirmations";
import { respondGroupMembership, respondGroupParent } from "@/features/groups/actions";
import type {
  PendingGroupInvite,
  PendingParentProposal,
} from "@/features/groups/types";
import { confirmCoOwnership, declineCoOwnership } from "@/features/network/co-ownership";
import type { CoOwnerProposal } from "@/features/network/co-ownership-queries";

type Props = {
  groupInvites: PendingGroupInvite[];
  parentProposals: PendingParentProposal[];
  coOwnerProposals: CoOwnerProposal[];
  caseStudyConfirmations: PendingCaseStudyConfirmation[];
  viewerCompanyId: string | null;
};

function Row({
  text,
  children,
}: {
  text: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
      <p className="text-[13px] text-ink">{text}</p>
      <div className="flex shrink-0 gap-2">{children}</div>
    </li>
  );
}

/** Everything waiting on the viewer across group invites, ownership, and case studies — one place. */
export function DashboardRequests({
  groupInvites,
  parentProposals,
  coOwnerProposals,
  caseStudyConfirmations,
  viewerCompanyId,
}: Props) {
  const total =
    groupInvites.length +
    parentProposals.length +
    coOwnerProposals.length +
    caseStudyConfirmations.length;

  if (total === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-surface/60 px-5 py-8 text-center text-[13px] text-muted">
        No pending requests — subsidiary invites, shared-ownership proposals,
        and case study confirmations will show up here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groupInvites.length > 0 ? (
        <WorkspaceCard padded={false}>
          <ul className="divide-y divide-line">
            {groupInvites.map((invite) => (
              <Row
                key={`${invite.groupId}-${invite.companyId}`}
                text={
                  <>
                    <span className="font-semibold">{invite.groupName}</span>{" "}
                    invited <span className="font-semibold">{invite.companyName}</span>{" "}
                    to join their group.
                  </>
                }
              >
                <form action={respondGroupMembership}>
                  <input type="hidden" name="group_id" value={invite.groupId} />
                  <input type="hidden" name="company_id" value={invite.companyId} />
                  <input type="hidden" name="decision" value="confirmed" />
                  <Button type="submit" variant="primary" className="h-8 px-3 text-[11px]">
                    Confirm
                  </Button>
                </form>
                <form action={respondGroupMembership}>
                  <input type="hidden" name="group_id" value={invite.groupId} />
                  <input type="hidden" name="company_id" value={invite.companyId} />
                  <input type="hidden" name="decision" value="declined" />
                  <Button type="submit" variant="secondary" className="h-8 px-3 text-[11px]">
                    Decline
                  </Button>
                </form>
              </Row>
            ))}
          </ul>
        </WorkspaceCard>
      ) : null}

      {parentProposals.length > 0 ? (
        <WorkspaceCard padded={false}>
          <ul className="divide-y divide-line">
            {parentProposals.map((p) => (
              <Row
                key={`${p.groupId}-${p.companyId}`}
                text={
                  <>
                    <span className="font-semibold">{p.parentName}</span> wants
                    to become the parent of{" "}
                    <span className="font-semibold">{p.companyName}</span> in{" "}
                    {p.groupName}.
                  </>
                }
              >
                <form action={respondGroupParent}>
                  <input type="hidden" name="group_id" value={p.groupId} />
                  <input type="hidden" name="company_id" value={p.companyId} />
                  <input type="hidden" name="decision" value="confirmed" />
                  <Button type="submit" variant="primary" className="h-8 px-3 text-[11px]">
                    Confirm
                  </Button>
                </form>
                <form action={respondGroupParent}>
                  <input type="hidden" name="group_id" value={p.groupId} />
                  <input type="hidden" name="company_id" value={p.companyId} />
                  <input type="hidden" name="decision" value="declined" />
                  <Button type="submit" variant="secondary" className="h-8 px-3 text-[11px]">
                    Decline
                  </Button>
                </form>
              </Row>
            ))}
          </ul>
        </WorkspaceCard>
      ) : null}

      {coOwnerProposals.length > 0 ? (
        <WorkspaceCard padded={false}>
          <ul className="divide-y divide-line">
            {coOwnerProposals.map((p) => {
              const iAmCoParent = p.coParentCompanyId === viewerCompanyId;
              const otherName = iAmCoParent ? p.childName : p.coParentName;
              return (
                <Row
                  key={p.id}
                  text={
                    <>
                      <span className="font-semibold">{otherName}</span>{" "}
                      proposes shared ownership of{" "}
                      <span className="font-semibold">{p.childName}</span>.
                    </>
                  }
                >
                  <form action={confirmCoOwnership}>
                    <input type="hidden" name="edge_id" value={p.id} />
                    <input type="hidden" name="back" value="/dashboard/inbox?tab=requests" />
                    <Button type="submit" variant="primary" className="h-8 px-3 text-[11px]">
                      Confirm
                    </Button>
                  </form>
                  <form action={declineCoOwnership}>
                    <input type="hidden" name="edge_id" value={p.id} />
                    <input type="hidden" name="back" value="/dashboard/inbox?tab=requests" />
                    <Button type="submit" variant="secondary" className="h-8 px-3 text-[11px]">
                      Decline
                    </Button>
                  </form>
                </Row>
              );
            })}
          </ul>
        </WorkspaceCard>
      ) : null}

      {caseStudyConfirmations.length > 0 ? (
        <WorkspaceCard padded={false}>
          <ul className="divide-y divide-line">
            {caseStudyConfirmations.map((c) => (
              <Row
                key={c.caseStudyId}
                text={
                  <>
                    <span className="font-semibold">{c.ownerName}</span> tagged
                    you{c.role ? ` as ${c.role}` : ""} on{" "}
                    <Link
                      href={`/c/${c.ownerSlug}/case-studies/${c.slug}`}
                      className="font-semibold underline-offset-2 hover:underline"
                    >
                      {c.title}
                    </Link>
                    .
                  </>
                }
              >
                <form action={confirmCaseStudyPartnerRole}>
                  <input type="hidden" name="case_study_id" value={c.caseStudyId} />
                  <input type="hidden" name="back" value="/dashboard/inbox?tab=requests" />
                  <Button type="submit" variant="primary" className="h-8 px-3 text-[11px]">
                    Confirm
                  </Button>
                </form>
              </Row>
            ))}
          </ul>
        </WorkspaceCard>
      ) : null}
    </div>
  );
}
