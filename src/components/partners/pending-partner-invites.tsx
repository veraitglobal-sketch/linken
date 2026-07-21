import Link from "next/link";
import { withdrawPartnership } from "@/features/network/actions";
import type { PartnershipRow } from "@/features/partners/inbox";
import { resendPendingPartnerInvite } from "@/features/partners/resend-pending-invite";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";

type Props = {
  rows: PartnershipRow[];
  back?: string;
};

function statusLine(row: PartnershipRow) {
  if (!row.other.claimed) {
    return "Waiting for them to join Linken and confirm";
  }
  return "Waiting for their response";
}

function invitedOn(iso: string | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PendingPartnerInvites({
  rows,
  back = "/dashboard/partners",
}: Props) {
  if (rows.length === 0) return null;

  return (
    <section>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Pending invites
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Not on Network until they confirm.
          </p>
        </div>
        <p className="text-[12px] font-medium text-plus">
          {rows.length} pending
        </p>
      </header>
      <WorkspaceCard padded={false}>
        <ul className="divide-y divide-line">
          {rows.map((row) => {
            const date = invitedOn(row.createdAt);
            const ghost = !row.other.claimed;
            return (
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
                  <p className="mt-0.5 text-[12px] font-medium text-ink">
                    {statusLine(row)}
                  </p>
                  {date ? (
                    <p className="mt-0.5 text-[11px] text-muted">
                      Invited {date}
                      {ghost ? " · Draft profile" : ""}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  {ghost ? (
                    <form action={resendPendingPartnerInvite}>
                      <input
                        type="hidden"
                        name="company_id"
                        value={row.other.id}
                      />
                      <input type="hidden" name="back" value={back} />
                      <Button
                        type="submit"
                        className="h-9 px-3.5 text-[12px]"
                      >
                        Resend
                      </Button>
                    </form>
                  ) : null}
                  <form action={withdrawPartnership}>
                    <input
                      type="hidden"
                      name="partnership_id"
                      value={row.id}
                    />
                    <input type="hidden" name="back" value={back} />
                    <Button
                      type="submit"
                      variant="ghost"
                      className="h-9 px-3.5 text-[12px]"
                    >
                      Withdraw
                    </Button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </WorkspaceCard>
    </section>
  );
}
