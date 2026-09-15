import type { ReactNode } from "react";
import { WorkspaceTabs } from "@/components/dashboard/workspace-tabs";

type Tab = "people" | "invite" | "you";

type Props = {
  active: Tab;
  membersCount: number;
  pendingCount: number;
  showInvite: boolean;
  showYou: boolean;
  youNeedsSetup?: boolean;
  /** Right side of the tab row — the page's primary action. */
  action?: ReactNode;
};

export function TeamTabs({ active, membersCount, pendingCount, showInvite, showYou, youNeedsSetup, action }: Props) {
  return (
    <WorkspaceTabs
      label="Team sections"
      active={active}
      action={action}
      tabs={[
        { id: "people", label: "People", href: "/dashboard/team?tab=people", meta: String(membersCount) },
        ...(showInvite
          ? [{ id: "invite", label: "Invite", href: "/dashboard/team?tab=invite", meta: pendingCount > 0 ? `${pendingCount} pending` : undefined }]
          : []),
        ...(showYou
          ? [{ id: "you", label: "Your card", href: "/dashboard/team?tab=you", meta: youNeedsSetup ? "Needs details" : undefined, attention: youNeedsSetup }]
          : []),
      ]}
    />
  );
}
