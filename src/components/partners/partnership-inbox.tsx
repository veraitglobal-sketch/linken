import Link from "next/link";
import { respondPartnership } from "@/features/network/actions";
import type { PartnershipRow } from "@/features/partners/inbox";
import { PartnershipAcceptedList } from "@/components/partners/partnership-accepted-list";
import { PendingPartnerInvites } from "@/components/partners/pending-partner-invites";
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
    <div className="space-y-10">
      {incomingPending.length > 0 ? (
        <section>
          <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
                Incoming requests
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                Accept to become official — then the link shows on Network.
              </p>
            </div>
            <p className="text-[12px] font-medium text-plus">
              {incomingPending.length} open
            </p>
          </header>
          <WorkspaceCard padded={false}>
            <ul className="divide-y divide-line">
              {incomingPending.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/c/${row.other.slug}`}
                      className="text-[14px] font-semibold text-ink underline-offset-2 hover:underline"
                    >
                      {row.other.name}
                    </Link>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {[row.other.category, row.other.city]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={respondPartnership}>
                      <input
                        type="hidden"
                        name="partnership_id"
                        value={row.id}
                      />
                      <input type="hidden" name="decision" value="accepted" />
                      <input
                        type="hidden"
                        name="back"
                        value="/dashboard/partners"
                      />
                      <Button type="submit" className="h-9 px-3.5 text-[12px]">
                        Accept
                      </Button>
                    </form>
                    <form action={respondPartnership}>
                      <input
                        type="hidden"
                        name="partnership_id"
                        value={row.id}
                      />
                      <input type="hidden" name="decision" value="declined" />
                      <input
                        type="hidden"
                        name="back"
                        value="/dashboard/partners"
                      />
                      <Button
                        type="submit"
                        variant="ghost"
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
        </section>
      ) : null}

      <PendingPartnerInvites rows={outgoingPending} />
      <PartnershipAcceptedList accepted={accepted} />
    </div>
  );
}
