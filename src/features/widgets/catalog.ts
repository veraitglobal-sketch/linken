import {
  logoWallHeight,
  type LogoMotion,
  type LogoSize,
} from "@/features/widgets/logo-motion";

export type WidgetVariant =
  | "compact"
  | "badge"
  | "references"
  | "assessment"
  | "logo-wall";
export type WidgetTheme = "light" | "dark";
export type LogoWallLabel = "none" | "partners" | "clients" | "both";
/** @deprecated kept for old embeds — ignored by clean logo wall */
export type LogoWallDensity = "tiles+names" | "tiles";

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
  section: "status" | "evidence";
  recommended?: boolean;
  pro?: boolean;
  height: number;
  requirementHint?: string;
  unavailableCtaHref?: string;
  unavailableCtaLabel?: string;
};

export const WIDGET_CATALOG: WidgetDefinition[] = [
  {
    id: "compact",
    name: "Compact",
    description:
      "Trust bar with Linken seal and sliding partner logos.",
    section: "status",
    recommended: true,
    height: 48,
  },
  {
    id: "badge",
    name: "Badge",
    description:
      "Company card with sliding partner logos and Linken seal.",
    section: "status",
    height: 88,
  },
  {
    id: "references",
    name: "References",
    description: "List of confirmed client relationships on your profile.",
    section: "evidence",
    height: 160,
    requirementHint: "Requires at least one confirmed client reference.",
    unavailableCtaHref: "/dashboard/partners",
    unavailableCtaLabel: "Confirm clients on your profile",
  },
  {
    id: "assessment",
    name: "Client assessment",
    description: "“N of M would work again” plus top strengths.",
    section: "evidence",
    height: 120,
    requirementHint: "Requires ≥3 client answers",
    unavailableCtaHref: "/dashboard",
    unavailableCtaLabel: "Invite clients to confirm",
  },
  {
    id: "logo-wall",
    name: "Logo wall",
    description:
      "Clean partner logos — no cards. Row, vertical, fade, or grid.",
    section: "evidence",
    pro: true,
    height: 72,
    requirementHint: "Requires at least one confirmed partnership or client.",
    unavailableCtaHref: "/dashboard/partners",
    unavailableCtaLabel: "confirm your first partnership",
  },
];

export function parseLogoWallDensity(raw: string | undefined): LogoWallDensity {
  return raw === "tiles" ? "tiles" : "tiles+names";
}

export function widgetHeight(
  variant: WidgetVariant,
  opts?: { motion?: LogoMotion; size?: LogoSize },
): number {
  if (variant === "logo-wall") {
    return logoWallHeight(opts?.motion ?? "row", opts?.size ?? "md");
  }
  return WIDGET_CATALOG.find((w) => w.id === variant)?.height ?? 72;
}

export function buildEmbedSrc(input: {
  siteUrl: string;
  slug: string;
  variant: WidgetVariant;
  theme: WidgetTheme;
  width?: string;
  preview?: boolean;
  label?: LogoWallLabel;
  mono?: boolean;
  motion?: LogoMotion;
  size?: LogoSize;
}): string {
  const url = new URL(`${input.siteUrl}/embed/${input.slug}`);
  if (input.variant !== "badge") {
    url.searchParams.set("variant", input.variant);
  }
  if (input.theme === "dark") {
    url.searchParams.set("theme", "dark");
  }
  if (input.width && input.width !== "100%") {
    const w = input.width.replace(/px$/i, "");
    url.searchParams.set("w", w);
  }
  if (input.variant === "logo-wall") {
    if (input.label && input.label !== "both") {
      url.searchParams.set("label", input.label);
    }
    // mono defaults on for clean walls — only send when off
    if (input.mono === false) {
      url.searchParams.set("mono", "0");
    }
    if (input.motion && input.motion !== "row") {
      url.searchParams.set("motion", input.motion);
    }
    if (input.size && input.size !== "md") {
      url.searchParams.set("size", input.size);
    }
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
  label?: LogoWallLabel;
  mono?: boolean;
  motion?: LogoMotion;
  size?: LogoSize;
}): string {
  const height = widgetHeight(input.variant, {
    motion: input.motion,
    size: input.size,
  });
  const isFluid = input.width === "100%";
  const px = input.width.replace(/px$/i, "");
  const src = buildEmbedSrc({
    siteUrl: input.siteUrl,
    slug: input.slug,
    variant: input.variant,
    theme: input.theme,
    width: isFluid ? undefined : px,
    label: input.label,
    mono: input.mono,
    motion: input.motion,
    size: input.size,
  });
  const widthAttr = isFluid ? "100%" : px;
  const styleWidth = isFluid ? "100%" : `${px}px`;
  return `<iframe src="${src}" width="${widthAttr}" height="${height}" style="border:0;width:${styleWidth};max-width:100%;background:transparent" title="Verified on Linken" loading="lazy"></iframe>`;
}
