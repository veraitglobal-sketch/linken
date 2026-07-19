export type CompanyPlan = "free" | "pro" | "founding";

export type Entitlements = {
  instantInquiryNotifications: boolean;
  fullAnalytics: boolean;
  onePagerBranding: boolean;
};

const FREE: Entitlements = {
  instantInquiryNotifications: false,
  fullAnalytics: false,
  onePagerBranding: false,
};

const PRO: Entitlements = {
  instantInquiryNotifications: true,
  fullAnalytics: true,
  onePagerBranding: true,
};

/** Single map from plan → product capabilities. */
export function getEntitlements(plan: CompanyPlan | string | null | undefined): Entitlements {
  if (plan === "pro" || plan === "founding") return PRO;
  return FREE;
}

export function parsePlan(value: unknown): CompanyPlan {
  if (value === "pro" || value === "founding" || value === "free") return value;
  return "free";
}
