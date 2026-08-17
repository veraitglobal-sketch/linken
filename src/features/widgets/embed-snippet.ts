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
  /** Testimonials only: this placement's own shape, overriding the saved one. */
  layout?: string;
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
  /* Carried in the URL so one company can run more than one shape at once — a
     wall on the homepage and a strip in the footer. Records, order and theme
     still come from settings, so "embed once, configure forever" holds where it
     matters: a new confirmed testimonial appears in both without anyone
     touching either snippet. Only the shape is fixed at paste time. */
  if (input.layout) {
    url.searchParams.set("layout", input.layout);
  }
  return url.toString();
}

export function buildEmbedSnippet(input: {
  siteUrl: string;
  slug: string;
  variant: WidgetVariant;
  theme: WidgetTheme;
  width: string;
  layout?: string;
  /** Height for that layout — the resize script corrects it, this avoids a jump. */
  height?: number;
}): string {
  const height = input.height ?? widgetHeight(input.variant);
  const isFluid = input.width === "100%";
  const px = input.width.replace(/px$/i, "");
  const src = buildEmbedSrc({
    siteUrl: input.siteUrl,
    slug: input.slug,
    variant: input.variant,
    theme: input.theme,
    width: isFluid ? undefined : px,
    preview: false,
    layout: input.layout,
  });
  const widthAttr = isFluid ? "100%" : px;
  const styleWidth = isFluid ? "100%" : `${px}px`;
  const resizeAttr =
    input.variant === "testimonials" ? ' data-hansala-embed="1"' : "";
  const iframe = `<iframe src="${src}" width="${widthAttr}" height="${height}"${resizeAttr} style="border:0;width:${styleWidth};max-width:100%;background:transparent" title="Verified on Hansala" loading="lazy"></iframe>`;
  if (input.variant !== "testimonials") return iframe;
  const scriptSrc = `${input.siteUrl}/embed-resize.js`;
  return `${iframe}\n<script src="${scriptSrc}" async></script>`;
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
