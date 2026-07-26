import { logoWallHeight } from "@/features/widgets/logo-motion";

export type WidgetVariant =
  | "verified"
  | "micro"
  | "horizontal"
  | "starter"
  | "score"
  | "trust-card"
  | "credentials"
  | "signature"
  | "references"
  | "assessment"
  | "logo-wall"
  | "case-stamp";

export type WidgetTheme = "light" | "dark";
export type WidgetSection = "essential" | "proof" | "signature";

export type {
  LogoMotion,
  LogoSize,
} from "@/features/widgets/logo-motion";
export {
  LOGO_MOTION_OPTIONS,
  LOGO_SIZE_PX,
  logoWallHeight,
  parseLogoMotion,
  parseLogoSize,
} from "@/features/widgets/logo-motion";

export type WidgetDefinition = {
  id: WidgetVariant;
  name: string;
  description: string;
  section: WidgetSection;
  recommended?: boolean;
  pro?: boolean;
  height: number;
  requirementHint?: string;
  unavailableCtaHref?: string;
  unavailableCtaLabel?: string;
  /** Case-study scoped — not in company /embed/[slug] picker. */
  caseScoped?: boolean;
};

export const WIDGET_CATALOG: WidgetDefinition[] = [
  {
    id: "verified",
    name: "Verified",
    description: "Minimal Hansala Verified lockup for footers.",
    section: "essential",
    recommended: true,
    height: 44,
  },
  {
    id: "micro",
    name: "Micro",
    description: "Status word, proof strip, and Hansala seal — no logos.",
    section: "essential",
    height: 52,
  },
  {
    id: "horizontal",
    name: "Horizontal",
    description: "Full-width trust bar with level, proof strip, and count.",
    section: "essential",
    height: 56,
  },
  {
    id: "starter",
    name: "Starter",
    description: "Dark premium bar — Trustpilot-style, no partner logos.",
    section: "proof",
    pro: true,
    height: 120,
  },
  {
    id: "score",
    name: "TrustScore",
    description: "Large confirmed count with proof strip and level.",
    section: "proof",
    pro: true,
    height: 88,
  },
  {
    id: "trust-card",
    name: "Trust card",
    description: "Hansala Level with partners, clients, and projects.",
    section: "proof",
    pro: true,
    height: 132,
  },
  {
    id: "credentials",
    name: "Credentials",
    description: "Compact partners · clients · projects strip.",
    section: "proof",
    pro: true,
    height: 76,
  },
  {
    id: "references",
    name: "References",
    description: "Confirmed client list — initials only, never logos.",
    section: "proof",
    pro: true,
    height: 160,
    requirementHint: "Requires at least one confirmed client reference.",
    unavailableCtaHref: "/dashboard/partners",
    unavailableCtaLabel: "Confirm clients",
  },
  {
    id: "assessment",
    name: "Client assessment",
    description: "Would-work-again score and strengths.",
    section: "proof",
    pro: true,
    height: 120,
    requirementHint: "Requires ≥3 client answers",
    unavailableCtaHref: "/dashboard",
    unavailableCtaLabel: "Invite clients",
  },
  {
    id: "signature",
    name: "Signature seal",
    description: "Centered premium seal with level and count.",
    section: "signature",
    pro: true,
    height: 160,
  },
  {
    id: "logo-wall",
    name: "Logo wall",
    description:
      "Hansala Verified lockup above partner logos — curated from the studio.",
    section: "proof",
    pro: true,
    height: logoWallHeight("grid", "md"),
    requirementHint: "Requires at least one confirmed partner or client.",
    unavailableCtaHref: "/dashboard/partners",
    unavailableCtaLabel: "Confirm partners",
  },
  {
    id: "case-stamp",
    name: "Case confirmation stamp",
    description:
      "Small strip for your case page — only renders when the client confirmed.",
    section: "proof",
    height: 72,
    caseScoped: true,
    requirementHint: "Requires a client-confirmed case study.",
    unavailableCtaHref: "/dashboard/cases",
    unavailableCtaLabel: "Open cases",
  },
];

export {
  buildCaseStampSnippet,
  buildEmbedSnippet,
  buildEmbedSrc,
  widgetHeight,
} from "@/features/widgets/embed-snippet";

