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
        title: "Create your company profile",
        body: "Your public page starts here — then invite someone to confirm.",
        href: "/onboarding",
        cta: "Create company",
      };
    case "billing_problem":
      return {
        id: "fix_billing",
        title: "There is a billing problem",
        body: "Update payment so Pro features stay available after the grace period.",
        href: "/dashboard/billing",
        cta: "Open billing",
      };
    case "unverified":
      return {
        id: "verify_domain",
        title: "Verify your domain",
        body: "Unlock official partnerships and the Verified badge. Pending invites stay private either way.",
        href: "/dashboard/verification",
        cta: "Verify domain",
      };
    case "no_projects":
      return {
        id: "add_relationship",
        title: "Add your first project or relationship",
        body: "A case study, service reference, or partner — then invite them to confirm.",
        href: "/dashboard/cases/new",
        cta: "Add project",
      };
    case "no_invitation":
      return {
        id: "send_invite",
        title: "Send the first confirmation invite",
        body: "Nothing is public until they confirm. They open a secure link — no maze.",
        href: `${profile}#references`,
        cta: "Send invite",
      };
    case "invitation_pending":
      return {
        id: "follow_up",
        title: "Follow up on pending invitations",
        body: "Remind the other side, or add another relationship while you wait.",
        href: "/dashboard/inbox",
        cta: "View pending",
      };
    case "first_confirmed":
      return {
        id: "share_proof",
        title: "Share your verified proof",
        body: "Put the badge or a one-pager on your site and in proposals.",
        href: "/dashboard/widgets",
        cta: "Set up embed",
      };
    case "pro_active":
    case "active":
      return {
        id: "add_another",
        title: "Add another confirmed project",
        body: "Each confirmation strengthens your public network.",
        href: "/dashboard/cases/new",
        cta: "New case study",
      };
  }
}
