import type { DashboardHomeKind } from "@/features/dashboard/home-state";

const TIPS: Partial<Record<DashboardHomeKind, string>> = {
  unverified:
    "Tip: verify with a mailbox on your company domain — fastest path to the badge.",
  no_projects:
    "Tip: start with one real client relationship. Pending stays private until they confirm.",
  no_invitation:
    "Tip: the invitee opens a secure link. They can claim or create a company from there.",
  invitation_pending:
    "Tip: most confirmations arrive within a few business days. You can add another project meanwhile.",
  first_confirmed:
    "Tip: attach your one-pager or embed to proposals — same confirmed records as your profile.",
  active:
    "Tip: your Map fills itself as partners confirm. Open it anytime under Map.",
  pro_active:
    "Tip: widgets and the Agent API stay in sync with every new confirmation.",
  billing_problem:
    "Tip: update the card in Billing — Pro unlocks stay until the period ends if you cancel cleanly.",
};

export function HomeTips({ kind }: { kind: DashboardHomeKind }) {
  const tip = TIPS[kind];
  if (!tip) return null;
  return (
    <aside className="rounded-[20px] border border-dashed border-line bg-paper px-5 py-4 text-[13px] leading-relaxed text-ink-soft">
      {tip}
    </aside>
  );
}
