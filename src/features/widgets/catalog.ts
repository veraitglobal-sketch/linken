import {
  logoWallHeight,
  type LogoMotion,
  type LogoSize,
} from "@/features/widgets/logo-motion";

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
  | "assessment";

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
];

export function widgetHeight(variant: WidgetVariant): number {
  return WIDGET_CATALOG.find((w) => w.id === variant)?.height ?? 72;
}

export function buildEmbedSrc(input: {
  siteUrl: string;
  slug: string;
  variant: WidgetVariant;
  theme: WidgetTheme;
  width?: string;
  preview?: boolean;
}): string {
  const url = new URL(`${input.siteUrl}/embed/${input.slug}`);
  if (input.variant !== "horizontal") {
    url.searchParams.set("variant", input.variant);
  }
  if (input.theme === "dark") {
    url.searchParams.set("theme", "dark");
  }
  if (input.width && input.width !== "100%") {
    url.searchParams.set("w", input.width.replace(/px$/i, ""));
  }
  if (input.preview) {
    url.searchParams.set("preview", "1");
  }
  return url.toString();
}

export function buildEmbedSnippet(input: {
  siteUrl: string;
  slug: string;
  variant: WidgetVariant;
  theme: WidgetTheme;
  width: string;
}): string {
  const height = widgetHeight(input.variant);
  const isFluid = input.width === "100%";
  const px = input.width.replace(/px$/i, "");
  const src = buildEmbedSrc({
    siteUrl: input.siteUrl,
    slug: input.slug,
    variant: input.variant,
    theme: input.theme,
    width: isFluid ? undefined : px,
    preview: false,
  });
  const widthAttr = isFluid ? "100%" : px;
  const styleWidth = isFluid ? "100%" : `${px}px`;
  return `<iframe src="${src}" width="${widthAttr}" height="${height}" style="border:0;width:${styleWidth};max-width:100%;background:transparent" title="Verified on Hansala" loading="lazy"></iframe>`;
}
