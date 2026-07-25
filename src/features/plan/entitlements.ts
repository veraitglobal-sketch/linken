export type CompanyPlan = "free" | "pro" | "founding";

export type Entitlements = {
  fullAnalytics: boolean;
  /** Company-first one-pager chrome (free keeps Hansala watermark). */
  onePagerBranding: boolean;
  /** Premium /embed variants + widgets studio unlock. */
  premiumEmbeds: boolean;
  /** Agent API keys and programmatic access. */
  agentApi: boolean;
  /** Max team members including owner. Free = owner only. */
  maxTeamMembers: number;
  /** companies.radar add-on — Instant Radar digest emails. */
  radarInstantAlerts: boolean;
  /** companies.radar add-on — spend marketplace credits. */
  radarCredits: boolean;
};

const FREE: Omit<Entitlements, "radarInstantAlerts" | "radarCredits"> = {
  fullAnalytics: false,
  onePagerBranding: false,
  premiumEmbeds: false,
  agentApi: false,
  maxTeamMembers: 1,
};

const PRO: Omit<Entitlements, "radarInstantAlerts" | "radarCredits"> = {
  fullAnalytics: true,
  onePagerBranding: true,
  premiumEmbeds: true,
  agentApi: true,
  maxTeamMembers: 25,
};

export type EntitlementOptions = {
  /** companies.radar add-on — stacks with free/pro/founding. Never public. */
  radar?: boolean;
};

/**
 * Plan → product capabilities.
 * Radar is an add-on flag (`companies.radar`), not a fourth plan value.
 */
export function getEntitlements(
  plan: CompanyPlan | string | null | undefined,
  options?: EntitlementOptions,
): Entitlements {
  const base = plan === "pro" || plan === "founding" ? PRO : FREE;
  const radar = Boolean(options?.radar);
  return {
    ...base,
    radarInstantAlerts: radar,
    radarCredits: radar,
  };
}

export function parsePlan(value: unknown): CompanyPlan {
  if (value === "pro" || value === "founding" || value === "free") return value;
  return "free";
}

/** Paid plan with product unlocks (includes founding). */
export function isPaidPlan(plan: CompanyPlan | string | null | undefined) {
  return plan === "pro" || plan === "founding";
}
