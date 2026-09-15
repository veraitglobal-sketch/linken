import { cancelTeamInvitation } from "@/features/team/actions";
import type { TeamInvitation } from "@/features/team/types";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

type Props = {
  pendingInvites: TeamInvitation[];
  back?: string;
};

function sent(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || d.getTime() === 0) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Side card — invitations waiting for someone to accept. */
export function TeamPendingInvites({ pendingInvites, back = "/dashboard/team?tab=people" }: Props) {
  return (
    <WorkspaceCard padded={false}>
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <p className="text-[14px] font-semibold text-ink">Pending invites</p>
        <span className="inline-flex h-6 items-center rounded-full bg-mute px-2 text-[12px] font-semibold text-ink-soft tabular-nums">
          {pendingInvites.length}
        </span>
      </div>
      {pendingInvites.length === 0 ? (
        <p className="border-t border-line px-5 py-4 text-[13px] text-muted">No invitations waiting.</p>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {pendingInvites.map((inv) => (
            <li key={inv.id} className="flex items-start gap-3 px-5 py-3.5">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-lime ring-2 ring-lime-soft" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ink">{inv.inviteName}</p>
                <p className="truncate text-[12px] text-muted">
                  {inv.inviteEmail} · {inv.role === "admin" ? "Admin" : "Member"}
                  {sent(inv.createdAt) ? ` · sent ${sent(inv.createdAt)}` : ""}
                </p>
              </div>
              <form action={cancelTeamInvitation}>
                <input type="hidden" name="invitation_id" value={inv.id} />
                <input type="hidden" name="back" value={back} />
                <button
                  type="submit"
                  className="h-8 rounded-lg px-2.5 text-[12px] font-semibold text-ink-soft transition-colors hover:bg-mute hover:text-ink"
                >
                  Cancel
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </WorkspaceCard>
  );
}
