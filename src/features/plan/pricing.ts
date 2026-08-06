import { getEntitlements } from "@/features/plan/entitlements";
import {
  FREE_PLAN_PRICE,
  PRO_PLAN_LABEL,
  PRO_PLAN_PRICE,
  proCta,
  pricingCtaMode,
  BILLING_UNIT,
  ANNUAL_BILLING_AVAILABLE,
} from "@/features/plan/pricing-meta";
import { PRICING_FAQ } from "@/features/plan/pricing-faq";

export {
  FREE_PLAN_PRICE,
  PRO_PLAN_LABEL,
  PRO_PLAN_PRICE,
  BILLING_UNIT,
  ANNUAL_BILLING_AVAILABLE,
  proCta,
  pricingCtaMode,
  PRICING_FAQ,
};

export type CompareValue = string | boolean;

export type PricingCompareRow = {
  feature: string;
  free: CompareValue;
  pro: CompareValue;
  note?: string;
};

const freeE = getEntitlements("free");
const proE = getEntitlements("pro");

/** Comparison matrix — only claims backed by entitlements / product behavior. */
export const PRICING_COMPARE: PricingCompareRow[] = [
  { feature: "Public company profile", free: true, pro: true },
  {
    feature: "Verified clients & partners",
    free: "Unlimited confirmed",
    pro: "Unlimited confirmed",
  },
  {
    feature: "Verified projects (case studies)",
    free: "Unlimited confirmed",
    pro: "Unlimited confirmed",
  },
  {
    feature: "Team members",
    free: `${freeE.maxTeamMembers} (owner only)`,
    pro: `Up to ${proE.maxTeamMembers}`,
  },
  {
    feature: "Invitations & confirmations",
    free: "Unlimited in product",
    pro: "Unlimited in product",
    note: "Agent API keys have a separate daily invite rate limit.",
  },
  {
    feature: "Website embeds",
    free: "Standard embeds",
    pro: "Premium embeds + widget studio",
  },
  {
    feature: "One-pager / proposal pack",
    free: "With Hansala mark",
    pro: "Your branding",
  },
  {
    feature: "Analytics",
    free: "Basic profile signals",
    pro: "Full profile analytics",
  },
  { feature: "Agent API", free: false, pro: proE.agentApi },
  { feature: "Webhooks", free: false, pro: proE.agentApi },
  {
    feature: "Data export",
    free: "Public profile & Public API",
    pro: "Public API + Agent API",
  },
  {
    feature: "Support",
    free: "Email",
    pro: "Email",
    note: "No separate paid support tier is configured yet.",
  },
];

export const FREE_HIGHLIGHTS = [
  "Company profile with domain verification badge",
  "Unlimited mutual confirmations (partners, references, projects)",
  "Standard website embeds",
  `${freeE.maxTeamMembers} team seat (owner)`,
] as const;

export const PRO_HIGHLIGHTS = [
  "Premium embeds and widget studio",
  "Full profile analytics",
  "Agent API and webhooks",
  "Branded one-pager for proposals",
  `Up to ${proE.maxTeamMembers} team seats`,
] as const;
