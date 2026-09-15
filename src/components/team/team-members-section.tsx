import Link from "next/link";
import type { TeamMember } from "@/features/team/types";
import { EditMemberAccess } from "@/components/team/edit-member-access";
import { TEAM_COLUMNS, TeamMemberRow } from "@/components/team/team-member-row";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { cn } from "@/lib/cn";

type Props = {
  members: TeamMember[];
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

/** Members as a table: who, role, profile visibility, access, joined. */
export function TeamMembersSection({ members, currentUserId, canManage, companyId }: Props) {
  const sorted = sortMembers(members, currentUserId);

  return (
    <WorkspaceCard padded={false} className="overflow-hidden">
      <div
        className={cn(
          "hidden border-b border-line bg-[#fafbf9] px-5 py-2.5 text-[11px] font-semibold tracking-[0.1em] text-muted uppercase",
          TEAM_COLUMNS,
        )}
      >
        <span>Person</span>
        <span>Role</span>
        <span>Profile</span>
        <span>Access</span>
        <span>Joined</span>
      </div>
      {sorted.length === 0 ? (
        <div className="px-5 py-14 text-center">
          <p className="text-[15px] font-semibold text-ink">No members yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
            Invite a colleague to share workspace access.
          </p>
          {canManage ? (
            <Link
              href="/dashboard/team?tab=invite"
              className="mt-4 inline-flex h-10 items-center rounded-xl bg-navy px-4 text-[13px] font-semibold text-on-navy"
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
                  <EditMemberAccess companyId={companyId} userId={m.userId} permissions={m.permissions} />
                ) : undefined
              }
            />
          ))}
        </ul>
      )}
    </WorkspaceCard>
  );
}
