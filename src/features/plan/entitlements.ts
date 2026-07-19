export type CompanyPlan = "free" | "pro" | "founding";

export type Entitlements = {
  instantInquiryNotifications: boolean;
  fullAnalytics: boolean;
  onePagerBranding: boolean;
  /** Website logo-wall embed — presentation paid, evidence stays free on profile. */
  logoWallWidget: boolean;
  /** Instant Radar digest emails for matching project requests. */
  radarInstantAlerts: boolean;
  /** Spend marketplace credits on Radar responses. */
  radarCredits: boolean;
};

const FREE: Entitlements = {
  instantInquiryNotifications: false,
  fullAnalytics: false,
  onePagerBranding: false,
  logoWallWidget: false,
  radarInstantAlerts: false,
  radarCredits: false,
};

const PRO: Entitlements = {
  instantInquiryNotifications: true,
  fullAnalytics: true,
  onePagerBranding: true,
  logoWallWidget: true,
  radarInstantAlerts: false,
  radarCredits: false,
};

export type EntitlementOptions = {
  /** companies.radar add-on — stacks with free/pro/founding. Never public. */
  radar?: boolean;
};

/**
 * Plan → product capabilities.
 * Radar is an add-on flag (`companies.radar`), not a fourth plan value —
 * so a firm can be Pro + Radar without replacing billing tiers.
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
