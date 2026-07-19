import {
  respondGroupMembership,
  respondGroupParent,
} from "@/features/groups/actions";
import type {
  PendingGroupInvite,
  PendingParentProposal,
} from "@/features/groups/types";
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
    <section className="rounded-[24px] border border-line bg-surface px-5 py-5">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
        Group invites
      </p>
      <ul className="mt-3 space-y-3">
        {invites.map((invite) => (
          <li
            key={`${invite.groupId}-${invite.companyId}`}
            className="rounded-2xl border border-line px-4 py-3"
          >
            <p className="text-[14px] font-medium text-ink">
              {invite.groupName}
            </p>
            <p className="mt-0.5 text-[13px] text-ink-soft">
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
                <Button type="submit" className="h-10 px-4">
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
                <Button type="submit" variant="secondary" className="h-10 px-4">
                  Decline
                </Button>
              </form>
            </div>
          </li>
        ))}

        {parentProposals.map((p) => (
          <li
            key={`parent-${p.groupId}-${p.companyId}`}
            className="rounded-2xl border border-line px-4 py-3"
          >
            <p className="text-[14px] font-medium text-ink">
              Nest under {p.parentName}
            </p>
            <p className="mt-0.5 text-[13px] text-ink-soft">
              {p.groupName} proposes placing {p.companyName} under{" "}
              {p.parentName} in the group tree.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={respondGroupParent}>
                <input type="hidden" name="group_id" value={p.groupId} />
                <input type="hidden" name="company_id" value={p.companyId} />
                <input type="hidden" name="decision" value="confirmed" />
                <Button type="submit" className="h-10 px-4">
                  Accept
                </Button>
              </form>
              <form action={respondGroupParent}>
                <input type="hidden" name="group_id" value={p.groupId} />
                <input type="hidden" name="company_id" value={p.companyId} />
                <input type="hidden" name="decision" value="declined" />
                <Button type="submit" variant="secondary" className="h-10 px-4">
                  Decline
                </Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
