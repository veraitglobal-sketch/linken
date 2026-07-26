import {
  WIDGET_CATALOG,
  type WidgetTheme,
  type WidgetVariant,
} from "@/features/widgets/catalog";

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

/** Pasteable iframe for /embed/[slug]/case/[caseSlug]. */
export function buildCaseStampSnippet(input: {
  siteUrl: string;
  slug: string;
  caseSlug: string;
  theme?: WidgetTheme;
}): string {
  const url = new URL(
    `${input.siteUrl}/embed/${input.slug}/case/${input.caseSlug}`,
  );
  if (input.theme === "dark") url.searchParams.set("theme", "dark");
  return `<iframe src="${url}" width="100%" height="72" style="border:0;width:100%;max-width:100%;background:transparent" title="Confirmed on Hansala" loading="lazy"></iframe>`;
}
