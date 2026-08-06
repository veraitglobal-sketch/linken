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

  const hasInvitationSent =
    input.refs.some((r) => Boolean(r.invite_email?.trim())) ||
    input.confReqs.some((r) => Boolean(r.email?.trim())) ||
    Boolean(input.hasPartnerInviteSent);

  const hasConfirmation =
    input.refs.some((r) => r.status === "confirmed") ||
    input.partnerships.some((r) => r.status === "accepted") ||
    input.confReqs.some((r) => r.status === "confirmed") ||
    input.hasConfirmedCasePartner;

  return {
    companySlug: input.companySlug,
    verified: input.verified,
    hasRelationship,
    hasInvitationSent,
    hasConfirmation,
    hasProofShared: input.websiteLinked || input.hasEmbedView,
  };
}
