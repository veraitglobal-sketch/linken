/**
 * Pure dashboard home state — keep in sync with scripts/test-dashboard-home.mjs
 */

export type DashboardHomeKind =
  | "no_company"
  | "unverified"
  | "no_projects"
  | "no_invitation"
  | "invitation_pending"
  | "first_confirmed"
  | "active"
  | "pro_active"
  | "billing_problem";

export type HomePrimaryAction = {
  id: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

export type HomeSignals = {
  hasCompany: boolean;
  verified: boolean;
  relationshipCount: number;
  invitationSent: boolean;
  pendingInvites: number;
  confirmedCount: number;
  proofShared: boolean;
  isPro: boolean;
  billingProblem: boolean;
  profileComplete: boolean;
};

export function deriveHomeKind(s: HomeSignals): DashboardHomeKind {
  if (!s.hasCompany) return "no_company";
  if (s.billingProblem) return "billing_problem";
  if (!s.verified) return "unverified";
  if (s.relationshipCount === 0) return "no_projects";
  if (!s.invitationSent) return "no_invitation";
  if (s.pendingInvites > 0 && s.confirmedCount === 0) {
    return "invitation_pending";
  }
  if (s.confirmedCount === 1 && !s.isPro) return "first_confirmed";
  if (s.isPro && s.confirmedCount >= 1) return "pro_active";
  if (s.confirmedCount >= 2) return "active";
  if (s.confirmedCount >= 1) return "first_confirmed";
  return "invitation_pending";
}

export function primaryActionFor(
  kind: DashboardHomeKind,
  companySlug: string,
): HomePrimaryAction {
  const profile = `/c/${companySlug}`;
  switch (kind) {
    case "no_company":
      return {
        id: "create_company",
        title: "Create your company",
        body: "Then invite someone to confirm.",
        href: "/onboarding",
        cta: "Create company",
      };
    case "billing_problem":
      return {
        id: "fix_billing",
        title: "Billing needs attention",
        body: "Update payment so Pro stays available.",
        href: "/dashboard/billing",
        cta: "Open billing",
      };
    case "unverified":
      return {
        id: "verify_domain",
        title: "Verify your domain",
        body: "Unlocks official partnerships and the badge.",
        href: "/dashboard/verification",
        cta: "Verify domain",
      };
    case "no_projects":
      return {
        id: "add_relationship",
        title: "Add a project",
        body: "Then invite the other side to confirm.",
        href: "/dashboard/cases/new",
        cta: "Add project",
      };
    case "no_invitation":
      return {
        id: "send_invite",
        title: "Send the first invite",
        body: "Nothing is public until they confirm.",
        href: `${profile}#references`,
        cta: "Send invite",
      };
    case "invitation_pending":
      return {
        id: "follow_up",
        title: "Waiting on confirmation",
        body: "Remind them, or add another project.",
        href: "/dashboard/inbox",
        cta: "View pending",
      };
    case "first_confirmed":
      return {
        id: "share_proof",
        title: "Share the record",
        body: "Badge or one-pager — same confirmed facts.",
        href: "/dashboard/widgets",
        cta: "Set up embed",
      };
    case "pro_active":
    case "active":
      return {
        id: "add_another",
        title: "Add another project",
        body: "Each confirmation strengthens the network.",
        href: "/dashboard/cases/new",
        cta: "New case study",
      };
  }
}
