import Link from "next/link";
import type { TeamInvitation, TeamMember } from "@/features/team/types";
import { EditMemberAccess } from "@/components/team/edit-member-access";
import { TeamMemberRow } from "@/components/team/team-member-row";
import { TeamPendingInvites } from "@/components/team/team-pending-invites";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

type Props = {
  members: TeamMember[];
  pendingInvites: TeamInvitation[];
  currentUserId?: string | null;
  canManage: boolean;
  companyId: string;
};

function sortMembers(members: TeamMember[], currentUserId?: string | null) {
  const rank = (m: TeamMember) => {
    if (m.userId === currentUserId) return 0;
    if (m.role === "owner") return 1;
    if (m.role === "admin") return 2;
    return 3;
  };
  return [...members].sort((a, b) => {
    const d = rank(a) - rank(b);
    if (d !== 0) return d;
    return a.displayName.localeCompare(b.displayName);
  });
}

export function TeamMembersSection({
  members,
  pendingInvites,
  currentUserId,
  canManage,
  companyId,
}: Props) {
  const sorted = sortMembers(members, currentUserId);
  const publicCount = members.filter((m) => m.publicVisible).length;

  return (
    <div className="space-y-10">
      <section>
        <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
              Members
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              Access to this company workspace.
            </p>
          </div>
          <p className="text-[12px] font-medium text-plus">
            {members.length} · {publicCount} public
          </p>
        </header>
        <WorkspaceCard padded={false}>
          {sorted.length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-6">
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
                No members yet
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
                Invite a colleague to share workspace access.
              </p>
              {canManage ? (
                <Link
                  href="/dashboard/team?tab=invite"
                  className="mt-4 inline-flex h-9 items-center rounded-xl border border-line px-3.5 text-[12px] font-semibold text-ink transition-colors hover:bg-paper"
                >
                  Invite someone
                </Link>
              ) : null}
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {sorted.map((m, i) => (
                <TeamMemberRow
                  key={m.userId}
                  member={m}
                  isYou={m.userId === currentUserId}
                  index={i}
                  actions={
                    canManage && m.role === "member" ? (
                      <EditMemberAccess
                        companyId={companyId}
                        userId={m.userId}
                        permissions={m.permissions}
                      />
                    ) : undefined
                  }
                />
              ))}
            </ul>
          )}
        </WorkspaceCard>
      </section>

      {canManage ? (
        <TeamPendingInvites
          pendingInvites={pendingInvites}
          back="/dashboard/team?tab=people"
        />
      ) : null}
    </div>
  );
}
