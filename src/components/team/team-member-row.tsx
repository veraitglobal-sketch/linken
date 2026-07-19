import type { ReactNode } from "react";
import { LogoMark } from "@/components/ui/logo-mark";
import { Badge } from "@/components/ui/badge";
import { initialsFromName, type TeamMember } from "@/features/team/types";

type Props = {
  member: TeamMember;
  isYou?: boolean;
  actions?: ReactNode;
};

export function TeamMemberRow({ member, isYou, actions }: Props) {
  const name = member.displayName.trim() || (isYou ? "You" : "Unnamed");
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e8eaee] px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <LogoMark
          initials={initialsFromName(name)}
          logoUrl={member.photoUrl}
          size="sm"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[13px] font-semibold text-ink">
              {name}
              {isYou ? (
                <span className="ml-1.5 text-[11px] font-medium text-[#94a3b8]">
                  (you)
                </span>
              ) : null}
            </p>
            <Badge tone="neutral">{member.role}</Badge>
            <Badge tone={member.publicVisible ? "success" : "neutral"}>
              {member.publicVisible ? "Public" : "Hidden"}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-[12px] text-[#64748b]">
            {member.displayTitle.trim() || "—"}
          </p>
        </div>
      </div>
      {actions}
    </li>
  );
}
