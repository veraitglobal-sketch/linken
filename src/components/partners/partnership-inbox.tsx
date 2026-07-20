import Link from "next/link";
import {
  respondPartnership,
  withdrawPartnership,
} from "@/features/network/actions";
import type { PartnershipRow } from "@/features/partners/inbox";
import { PartnershipAcceptedList } from "@/components/partners/partnership-accepted-list";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";

type Props = {
  incomingPending: PartnershipRow[];
  outgoingPending: PartnershipRow[];
  accepted: PartnershipRow[];
};

export function PartnershipInbox({
  incomingPending,
  outgoingPending,
  accepted,
}: Props) {
  if (
    incomingPending.length === 0 &&
    outgoingPending.length === 0 &&
    accepted.length === 0
  ) {
    return null;
  }

  return (
    <div className="space-y-5">
      {incomingPending.length > 0 ? (
        <WorkspaceCard>
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
            Incoming requests
          </h3>
          <p className="mt-0.5 text-[12px] text-[#64748b]">
            Accept to become official partners — then the link appears on Network.
          </p>
          <ul className="mt-4 space-y-2">
            {incomingPending.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e8eaee] px-3 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/c/${row.other.slug}`}
                    className="text-[13px] font-semibold text-ink hover:underline"
                  >
                    {row.other.name}
                  </Link>
                  <p className="text-[11px] text-[#94a3b8]">
                    {[row.other.category, row.other.city]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={respondPartnership}>
                    <input type="hidden" name="partnership_id" value={row.id} />
                    <input type="hidden" name="decision" value="accepted" />
                    <input type="hidden" name="back" value="/dashboard/partners" />
                    <Button type="submit" className="h-8 px-3 text-[11px]">
                      Accept
                    </Button>
                  </form>
                  <form action={respondPartnership}>
                    <input type="hidden" name="partnership_id" value={row.id} />
                    <input type="hidden" name="decision" value="declined" />
                    <input type="hidden" name="back" value="/dashboard/partners" />
                    <Button
                      type="submit"
                      variant="ghost"
                      className="h-8 px-3 text-[11px]"
                    >
                      Decline
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </WorkspaceCard>
      ) : null}

      {outgoingPending.length > 0 ? (
        <WorkspaceCard>
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
            Waiting for acceptance
          </h3>
          <p className="mt-0.5 text-[12px] text-[#64748b]">
            Sent — not on the graph until they accept.
          </p>
          <ul className="mt-4 space-y-2">
            {outgoingPending.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e8eaee] px-3 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/c/${row.other.slug}`}
                    className="text-[13px] font-semibold text-ink hover:underline"
                  >
                    {row.other.name}
                  </Link>
                  <p className="text-[11px] font-medium text-[#d97706]">
                    Pending
                  </p>
                </div>
                <form action={withdrawPartnership}>
                  <input type="hidden" name="partnership_id" value={row.id} />
                  <input type="hidden" name="back" value="/dashboard/partners" />
                  <Button
                    type="submit"
                    variant="ghost"
                    className="h-8 px-3 text-[11px]"
                  >
                    Withdraw
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </WorkspaceCard>
      ) : null}

      <PartnershipAcceptedList accepted={accepted} />
    </div>
  );
}
