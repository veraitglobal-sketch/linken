export type WidgetVariant =
  | "compact"
  | "badge"
  | "references"
  | "assessment"
  | "logo-wall";
export type WidgetTheme = "light" | "dark";
export type LogoWallLabel = "none" | "partners" | "clients" | "both";
/** tiles+names = pločica + ime (default); tiles = samo pločice */
export type LogoWallDensity = "tiles+names" | "tiles";

export type WidgetDefinition = {
  id: WidgetVariant;
  name: string;
  description: string;
  section: "status" | "evidence";
  recommended?: boolean;
  pro?: boolean;
  height: number;
  /** Shown under the card when eligibility fails */
  requirementHint?: string;
  unavailableCtaHref?: string;
  unavailableCtaLabel?: string;
};

export const WIDGET_CATALOG: WidgetDefinition[] = [
  {
    id: "compact",
    name: "Compact",
    description: "One-line verified mark — lightest footprint on any page.",
    section: "status",
    recommended: true,
    height: 48,
  },
  {
    id: "badge",
    name: "Badge",
    description: "Card with partner and case study counts from confirmed evidence.",
    section: "status",
    height: 72,
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
      "Live verified partner & client logos for your website — clickable to Linken profiles.",
    section: "evidence",
    pro: true,
    height: 80,
    requirementHint: "Requires at least one confirmed partnership or client.",
    unavailableCtaHref: "/dashboard/partners",
    unavailableCtaLabel: "confirm your first partnership",
  },
];

export function parseLogoWallDensity(raw: string | undefined): LogoWallDensity {
  return raw === "tiles" ? "tiles" : "tiles+names";
}

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
  label?: LogoWallLabel;
  mono?: boolean;
  density?: LogoWallDensity;
}): string {
  const url = new URL(`${input.siteUrl}/embed/${input.slug}`);
  // badge is the default route — omit param for stable existing embeds
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
    if (input.mono) {
      url.searchParams.set("mono", "1");
    }
    if (input.density && input.density !== "tiles+names") {
      url.searchParams.set("density", input.density);
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
  density?: LogoWallDensity;
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
    label: input.label,
    mono: input.mono,
    density: input.density,
  });
  const widthAttr = isFluid ? "100%" : px;
  const styleWidth = isFluid ? "100%" : `${px}px`;
  return `<iframe src="${src}" width="${widthAttr}" height="${height}" style="border:0;width:${styleWidth};max-width:100%" title="Verified on Linken" loading="lazy"></iframe>`;
}
