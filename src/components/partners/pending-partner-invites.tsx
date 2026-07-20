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
    return "Invited — waiting for them to join Linken and confirm";
  }
  return "Invited — waiting for their response";
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
    <WorkspaceCard>
      <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
        Pending invites
      </h3>
      <p className="mt-0.5 text-[12px] leading-relaxed text-[#64748b]">
        Pending partners don&apos;t appear on your public network map until they
        confirm — this protects the accuracy of everyone&apos;s profile.
      </p>
      <ul className="mt-4 space-y-2">
        {rows.map((row) => {
          const date = invitedOn(row.createdAt);
          const ghost = !row.other.claimed;
          return (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[#e2e8f0] bg-[#fafbfc] px-3 py-3"
            >
              <div className="min-w-0">
                <Link
                  href={`/c/${row.other.slug}`}
                  className="text-[13px] font-semibold text-ink hover:underline"
                >
                  {row.other.name}
                </Link>
                <p className="mt-0.5 text-[11px] font-medium text-[#d97706]">
                  {statusLine(row)}
                </p>
                {date ? (
                  <p className="mt-0.5 text-[10px] text-[#94a3b8]">
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
                    <Button type="submit" className="h-8 px-3 text-[11px]">
                      Resend invite
                    </Button>
                  </form>
                ) : null}
                <form action={withdrawPartnership}>
                  <input type="hidden" name="partnership_id" value={row.id} />
                  <input type="hidden" name="back" value={back} />
                  <Button
                    type="submit"
                    variant="ghost"
                    className="h-8 px-3 text-[11px]"
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
  );
}
