import { cancelTeamInvitation } from "@/features/team/actions";
import type { TeamInvitation } from "@/features/team/types";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";

type Props = {
  pendingInvites: TeamInvitation[];
  back?: string;
};

export function TeamPendingInvites({
  pendingInvites,
  back = "/dashboard/team?tab=people",
}: Props) {
  if (pendingInvites.length === 0) return null;

  return (
    <section>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Pending invites
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Waiting for acceptance — not on the public profile yet.
          </p>
        </div>
        <p className="text-[12px] font-medium text-plus">
          {pendingInvites.length} pending
        </p>
      </header>
      <WorkspaceCard padded={false}>
        <ul className="divide-y divide-line">
          {pendingInvites.map((inv, i) => (
            <li
              key={inv.id}
              className="linken-widget-enter flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink">
                  {inv.inviteName}
                  {inv.inviteTitle ? (
                    <span className="font-normal text-muted">
                      {" "}
                      · {inv.inviteTitle}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {inv.inviteEmail} · {inv.role}
                </p>
              </div>
              <form action={cancelTeamInvitation}>
                <input type="hidden" name="invitation_id" value={inv.id} />
                <input type="hidden" name="back" value={back} />
                <Button
                  type="submit"
                  variant="ghost"
                  className="h-9 px-3.5 text-[12px]"
                >
                  Cancel
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </WorkspaceCard>
    </section>
  );
}
