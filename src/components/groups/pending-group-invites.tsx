import {
  respondGroupMembership,
  respondGroupParent,
} from "@/features/groups/actions";
import type {
  PendingGroupInvite,
  PendingParentProposal,
} from "@/features/groups/types";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";

type Props = {
  invites: PendingGroupInvite[];
  parentProposals?: PendingParentProposal[];
};

export function PendingGroupInvites({
  invites,
  parentProposals = [],
}: Props) {
  if (invites.length === 0 && parentProposals.length === 0) return null;

  return (
    <WorkspaceCard padded={false} className="overflow-hidden shadow-lg">
      <div className="border-b border-line px-4 py-3">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
          Group invites
        </p>
      </div>
      <ul className="divide-y divide-line">
        {invites.map((invite) => (
          <li
            key={`${invite.groupId}-${invite.companyId}`}
            className="px-4 py-3.5"
          >
            <p className="text-[14px] font-semibold text-ink">
              {invite.groupName}
            </p>
            <p className="mt-0.5 text-[12px] text-muted">
              Invited {invite.companyName} to join. Public only after you
              confirm.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={respondGroupMembership}>
                <input type="hidden" name="group_id" value={invite.groupId} />
                <input
                  type="hidden"
                  name="company_id"
                  value={invite.companyId}
                />
                <input type="hidden" name="decision" value="confirmed" />
                <Button type="submit" className="h-9 px-3.5 text-[12px]">
                  Confirm
                </Button>
              </form>
              <form action={respondGroupMembership}>
                <input type="hidden" name="group_id" value={invite.groupId} />
                <input
                  type="hidden"
                  name="company_id"
                  value={invite.companyId}
                />
                <input type="hidden" name="decision" value="declined" />
                <Button
                  type="submit"
                  variant="secondary"
                  className="h-9 px-3.5 text-[12px]"
                >
                  Decline
                </Button>
              </form>
            </div>
          </li>
        ))}

        {parentProposals.map((p) => (
          <li
            key={`parent-${p.groupId}-${p.companyId}`}
            className="px-4 py-3.5"
          >
            <p className="text-[14px] font-semibold text-ink">
              Nest under {p.parentName}
            </p>
            <p className="mt-0.5 text-[12px] text-muted">
              {p.groupName} proposes placing {p.companyName} under{" "}
              {p.parentName}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={respondGroupParent}>
                <input type="hidden" name="group_id" value={p.groupId} />
                <input type="hidden" name="company_id" value={p.companyId} />
                <input type="hidden" name="decision" value="confirmed" />
                <Button type="submit" className="h-9 px-3.5 text-[12px]">
                  Accept
                </Button>
              </form>
              <form action={respondGroupParent}>
                <input type="hidden" name="group_id" value={p.groupId} />
                <input type="hidden" name="company_id" value={p.companyId} />
                <input type="hidden" name="decision" value="declined" />
                <Button
                  type="submit"
                  variant="secondary"
                  className="h-9 px-3.5 text-[12px]"
                >
                  Decline
                </Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </WorkspaceCard>
  );
}
