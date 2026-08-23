/**
 * Pure activation progress — first verified reference is the win.
 * Keep in sync with scripts/test-activation-derive.mjs
 */

export type ActivationStepId =
  | "company_profile"
  | "domain_verified"
  | "first_relationship"
  | "first_invitation_sent"
  | "first_confirmed"
  | "proof_shared";

export type ActivationStep = {
  id: ActivationStepId;
  label: string;
  href: string;
  done: boolean;
};

export type ActivationSignals = {
  companySlug: string;
  verified: boolean;
  hasRelationship: boolean;
  hasInvitationSent: boolean;
  hasConfirmation: boolean;
  hasProofShared: boolean;
};

const LABELS: Record<ActivationStepId, string> = {
  company_profile: "Company profile created",
  domain_verified: "Domain verified",
  first_relationship: "First project or relationship added",
  first_invitation_sent: "First invitation sent",
  first_confirmed: "First reference confirmed",
  proof_shared: "Verified proof shared",
};

export function deriveActivationSteps(
  signals: ActivationSignals,
): ActivationStep[] {
  const profile = `/c/${signals.companySlug}`;
  return [
    {
      id: "company_profile",
      label: LABELS.company_profile,
      href: profile,
      done: true,
    },
    {
      id: "domain_verified",
      label: LABELS.domain_verified,
      href: "/dashboard/verification",
      done: signals.verified,
    },
    {
      id: "first_relationship",
      label: LABELS.first_relationship,
      href: "/dashboard/cases/new",
      done: signals.hasRelationship,
    },
    {
      id: "first_invitation_sent",
      label: LABELS.first_invitation_sent,
      href: `${profile}#references`,
      done: signals.hasInvitationSent,
    },
    {
      id: "first_confirmed",
      label: LABELS.first_confirmed,
      href: profile,
      done: signals.hasConfirmation,
    },
    {
      id: "proof_shared",
      label: LABELS.proof_shared,
      href: "/dashboard/widgets",
      done: signals.hasProofShared,
    },
  ];
}

/** Map raw DB rows → boolean signals (no I/O). */
export function signalsFromRows(input: {
  companySlug: string;
  verified: boolean;
  refs: { status: string; invite_email: string | null }[];
  caseCount: number;
  confReqs: { status: string; email: string | null }[];
  partnerships: { status: string }[];
  hasConfirmedCasePartner: boolean;
  websiteLinked: boolean;
  hasEmbedView: boolean;
  /** True when a partner claim invite email was recorded (optional). */
  hasPartnerInviteSent?: boolean;
}): ActivationSignals {
  const hasPartnership = input.partnerships.length > 0;
  const hasEvidence = input.refs.length > 0 || input.caseCount > 0;
  const hasRelationship = hasPartnership || hasEvidence;

  const hasConfirmation =
    input.refs.some((r) => r.status === "confirmed") ||
    input.partnerships.some((r) => r.status === "accepted") ||
    input.confReqs.some((r) => r.status === "confirmed") ||
    input.hasConfirmedCasePartner;

  /**
   * A confirmation cannot exist without an invitation.
   *
   * The explicit signals all look for a recorded email address, but a
   * partnership is matched company to company and never records one — so an
   * accepted partnership, or a confirmed case partner, ticked "First reference
   * confirmed" while leaving "First invitation sent" open above it. The
   * checklist then showed a state that cannot happen: somebody confirmed an
   * invitation nobody sent, and the owner sat on 5/6 with no way to reach 6.
   *
   * Implied rather than inferred from another table: whatever path produced the
   * confirmation, an invitation preceded it. That is true by definition of the
   * product, not by how any one row happens to be stored.
   */
  const hasInvitationSent =
    input.refs.some((r) => Boolean(r.invite_email?.trim())) ||
    input.confReqs.some((r) => Boolean(r.email?.trim())) ||
    Boolean(input.hasPartnerInviteSent) ||
    hasConfirmation;

  return {
    companySlug: input.companySlug,
    verified: input.verified,
    hasRelationship,
    hasInvitationSent,
    hasConfirmation,
    hasProofShared: input.websiteLinked || input.hasEmbedView,
  };
}
