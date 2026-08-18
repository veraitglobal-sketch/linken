import { HomePanel } from "@/components/dashboard/home/home-panel";
import type { DashboardHomeKind } from "@/features/dashboard/home-state";

const TIPS: Partial<Record<DashboardHomeKind, string>> = {
  unverified: "Use a mailbox on your company domain.",
  no_projects: "One real client. Pending stays private.",
  no_invitation: "They open a secure link — no maze.",
  invitation_pending: "Most replies take a few business days.",
  first_confirmed: "Attach the one-pager to the next proposal.",
  active: "The map fills as partners confirm.",
  pro_active: "Embeds and MCP stay in sync with each confirmation.",
  billing_problem: "Update the card in Billing.",
};

export function HomeTips({ kind }: { kind: DashboardHomeKind }) {
  const tip = TIPS[kind];
  if (!tip) return null;
  return (
    <HomePanel label="Note" muted>
      <p className="text-[13px] leading-relaxed text-ink-soft">{tip}</p>
    </HomePanel>
  );
}
