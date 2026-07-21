export type TrustLevel = "Member" | "Established" | "Trusted" | "Pillar";

export type TrustBreakdown = {
  confirmedPartners: number;
  confirmedReferences: number;
  ongoingReferences: number;
  clientConfirmedCaseStudies: number;
  partnerConfirmedCaseStudies: number;
};

export type TrustScoreInput = TrustBreakdown;

export type TrustScoreResult = {
  points: number;
  level: TrustLevel;
  breakdown: TrustBreakdown;
};

const LEVELS: TrustLevel[] = ["Member", "Established", "Trusted", "Pillar"];

/** Pure, testable scoring — confirmed evidence only. */
export function computeTrustScore(input: TrustScoreInput): TrustScoreResult {
  const breakdown: TrustBreakdown = {
    confirmedPartners: Math.max(0, input.confirmedPartners),
    confirmedReferences: Math.max(0, input.confirmedReferences),
    ongoingReferences: Math.max(0, input.ongoingReferences),
    clientConfirmedCaseStudies: Math.max(0, input.clientConfirmedCaseStudies),
    partnerConfirmedCaseStudies: Math.max(0, input.partnerConfirmedCaseStudies),
  };

  const points =
    breakdown.confirmedPartners * 2 +
    breakdown.confirmedReferences * 2 +
    breakdown.ongoingReferences * 3 +
    breakdown.clientConfirmedCaseStudies * 3 +
    breakdown.partnerConfirmedCaseStudies * 2;

  let level: TrustLevel = "Member";
  if (
    points >= 40 &&
    breakdown.ongoingReferences >= 3 &&
    breakdown.confirmedPartners >= 5
  ) {
    level = "Pillar";
  } else if (points >= 15 && breakdown.ongoingReferences >= 1) {
    level = "Trusted";
  } else if (points >= 5) {
    level = "Established";
  }

  return { points, level, breakdown };
}

export type TrustNextStep = {
  nextLevel: TrustLevel | null;
  pointsNeeded: number;
  hint: string;
  href: string;
};

export function getTrustNextStep(
  result: TrustScoreResult,
  companySlug: string,
): TrustNextStep {
  const { points, level, breakdown } = result;
  const idx = LEVELS.indexOf(level);
  const nextLevel = idx < LEVELS.length - 1 ? LEVELS[idx + 1]! : null;

  if (!nextLevel) {
    return {
      nextLevel: null,
      pointsNeeded: 0,
      hint: "You are at the highest Hansala Level.",
      href: `/c/${companySlug}`,
    };
  }

  if (nextLevel === "Established") {
    return {
      nextLevel,
      pointsNeeded: Math.max(5 - points, 0),
      hint: "Invite a partner to confirm, or ask a client to confirm a reference.",
      href: `/dashboard/partners?from=${companySlug}`,
    };
  }

  if (nextLevel === "Trusted") {
    if (breakdown.ongoingReferences < 1) {
      return {
        nextLevel,
        pointsNeeded: Math.max(15 - points, 0),
        hint: "Add an ongoing client reference and invite them to confirm.",
        href: `/c/${companySlug}#references`,
      };
    }
    return {
      nextLevel,
      pointsNeeded: Math.max(15 - points, 0),
      hint: "Earn more confirmed partners or client-confirmed case studies.",
      href: `/c/${companySlug}#case-studies`,
    };
  }

  // Pillar
  if (breakdown.ongoingReferences < 3) {
    return {
      nextLevel,
      pointsNeeded: Math.max(40 - points, 0),
      hint: `Confirm ${3 - breakdown.ongoingReferences} more ongoing client reference${3 - breakdown.ongoingReferences === 1 ? "" : "s"}.`,
      href: `/c/${companySlug}#references`,
    };
  }
  if (breakdown.confirmedPartners < 5) {
    return {
      nextLevel,
      pointsNeeded: Math.max(40 - points, 0),
      hint: `Invite ${5 - breakdown.confirmedPartners} more partners to confirm.`,
      href: `/dashboard/partners?from=${companySlug}`,
    };
  }
  return {
    nextLevel,
    pointsNeeded: Math.max(40 - points, 0),
    hint: "Keep adding confirmed client relationships and partners.",
    href: `/c/${companySlug}#references`,
  };
}
