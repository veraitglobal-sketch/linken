import type { ReactNode } from "react";
import { LogoMark } from "@/components/ui/logo-mark";
import { Badge } from "@/components/ui/badge";
import { initialsFromName, type TeamMember } from "@/features/team/types";

type Props = {
  member: TeamMember;
  isYou?: boolean;
  actions?: ReactNode;
  index?: number;
};

function roleLabel(role: string) {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  return "Member";
}

export function TeamMemberRow({ member, isYou, actions, index = 0 }: Props) {
  const name = member.displayName.trim() || (isYou ? "You" : "Unnamed");
  return (
    <li
      className="linken-widget-enter flex flex-wrap items-start justify-between gap-3 px-5 py-3.5 sm:px-6"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <LogoMark
          initials={initialsFromName(name)}
          logoUrl={member.photoUrl}
          size="sm"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[14px] font-semibold text-ink">
              {name}
              {isYou ? (
                <span className="ml-1.5 text-[11px] font-medium text-muted">
                  (you)
                </span>
              ) : null}
            </p>
            <Badge tone={member.role === "owner" ? "success" : "neutral"}>
              {roleLabel(member.role)}
            </Badge>
            <Badge tone={member.publicVisible ? "success" : "neutral"}>
              {member.publicVisible ? "Public" : "Hidden"}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-[12px] text-muted">
            {member.displayTitle.trim() || "No title yet"}
          </p>
        </div>
      </div>
      {actions ? (
        <div className="w-full min-w-0 sm:w-auto sm:max-w-sm sm:shrink-0">
          {actions}
        </div>
      ) : null}
    </li>
  );
}
