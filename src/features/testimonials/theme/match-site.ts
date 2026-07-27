import type { TestimonialThemeTokens } from "@/features/testimonials/theme/presets";

function pickCssVar(html: string, names: string[]): string | null {
  for (const name of names) {
    const re = new RegExp(`${name}\\s*:\\s*([^;}"']+)`, "i");
    const m = re.exec(html);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function pickBodyRule(html: string, prop: string): string | null {
  const re = new RegExp(`body\\s*\\{[\\s\\S]*?${prop}\\s*:\\s*([^;}"']+)`, "i");
  return re.exec(html)?.[1]?.trim() ?? null;
}

function pickLinkColor(html: string): string | null {
  const m = /a\s*\{[\s\S]*?color\s*:\s*([^;}"']+)/i.exec(html);
  return m?.[1]?.trim() ?? null;
}

function pickGoogleFont(html: string): string | null {
  const m = /fonts\.googleapis\.com\/css2\?family=([^"'&]+)/i.exec(html);
  if (!m?.[1]) return null;
  const name = decodeURIComponent(m[1].replace(/\+/g, " ").split(":")[0] ?? "");
  if (!name) return null;
  return `"${name}", system-ui, sans-serif`;
}

function pickRadius(html: string): number | null {
  const m = /border-radius\s*:\s*(\d+)px/i.exec(html);
  if (!m?.[1]) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

/** Best-effort theme extraction from homepage HTML (SSRF-safe fetch upstream). */
export function extractSiteThemeFromHtml(html: string): Partial<TestimonialThemeTokens> {
  const fontFamily =
    pickGoogleFont(html) ??
    pickBodyRule(html, "font-family") ??
    pickCssVar(html, ["--font-family", "--font-sans", "--body-font"]);

  const textColor =
    pickBodyRule(html, "color") ??
    pickCssVar(html, ["--foreground", "--text-color", "--color-text"]);

  const background =
    pickBodyRule(html, "background-color") ??
    pickBodyRule(html, "background") ??
    pickCssVar(html, ["--background", "--bg-color"]);

  const accentColor =
    pickLinkColor(html) ??
    pickCssVar(html, ["--primary", "--accent", "--brand", "--color-primary"]);

  const radius = pickRadius(html);

  const patch: Partial<TestimonialThemeTokens> = {};
  if (fontFamily) patch.fontFamily = fontFamily.slice(0, 200);
  if (textColor?.startsWith("#") || textColor?.startsWith("rgb")) {
    patch.textColor = textColor.slice(0, 32);
  }
  if (background?.startsWith("#") || background?.startsWith("rgb")) {
    patch.background = background.slice(0, 32);
    patch.cardBackground = background.slice(0, 32);
  }
  if (accentColor?.startsWith("#") || accentColor?.startsWith("rgb")) {
    patch.accentColor = accentColor.slice(0, 32);
  }
  if (radius !== null) patch.radius = radius;
  return patch;
}
