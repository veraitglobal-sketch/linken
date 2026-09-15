import type { ReactNode } from "react";
import { LogoMark } from "@/components/ui/logo-mark";
import { initialsFromName, type TeamMember } from "@/features/team/types";
import { WORKSPACE_SECTION_LABELS } from "@/features/workspace/sections";
import { cn } from "@/lib/cn";

type Props = {
  member: TeamMember;
  isYou?: boolean;
  actions?: ReactNode;
  index?: number;
};

/** Column template shared by the header row and every member row. */
export const TEAM_COLUMNS =
  "lg:grid lg:grid-cols-[minmax(0,1.7fr)_96px_104px_minmax(0,1.2fr)_104px] lg:items-center lg:gap-4";

function roleLabel(role: string) {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  return "Member";
}

function joined(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || d.getTime() === 0) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function TeamMemberRow({ member, isYou, actions, index = 0 }: Props) {
  const name = member.displayName.trim() || (isYou ? "You" : "Unnamed");
  const fullAccess = member.role !== "member";
  const sections = member.permissions.map((p) => WORKSPACE_SECTION_LABELS[p]);

  return (
    <li
      className="linken-widget-enter flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className={cn("min-w-0 flex-1 space-y-2 lg:space-y-0", TEAM_COLUMNS)}>
        <div className="flex min-w-0 items-center gap-3">
          <LogoMark initials={initialsFromName(name)} logoUrl={member.photoUrl} size="md" className="rounded-full!" />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-ink">
              {name}
              {isYou ? <span className="ml-1.5 text-[12px] font-medium text-muted">you</span> : null}
            </p>
            <p className="truncate text-[13px] text-muted">{member.displayTitle.trim() || "No title yet"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 lg:contents">
          <span>
            <span
              className={cn(
                "inline-flex h-7 items-center rounded-full px-2.5 text-[12px] font-semibold",
                member.role === "owner" ? "bg-navy text-lime" : member.role === "admin" ? "bg-lime text-navy" : "bg-mute text-ink",
              )}
            >
              {roleLabel(member.role)}
            </span>
          </span>
          <span>
            <span
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold",
                member.publicVisible ? "bg-lime-soft text-navy" : "text-muted ring-1 ring-line",
              )}
            >
              <span className={cn("size-1.5 rounded-full", member.publicVisible ? "bg-navy" : "bg-line")} />
              {member.publicVisible ? "Public" : "Hidden"}
            </span>
          </span>
          <span className="truncate text-[13px] text-ink-soft" title={fullAccess ? undefined : sections.join(", ")}>
            {fullAccess
              ? "All sections"
              : sections.length === 0
                ? "No sections"
                : sections.length <= 2
                  ? sections.join(", ")
                  : `${sections.slice(0, 2).join(", ")} +${sections.length - 2}`}
          </span>
          <span className="text-[13px] text-muted tabular-nums">{joined(member.createdAt)}</span>
        </div>
      </div>
      {actions ? <div className="ml-auto has-[form]:basis-full">{actions}</div> : null}
    </li>
  );
}
