/** Shared logo / icon discovery for logo fetch and Logo wall studio. */

import {
  collectJsonLdLogos,
  collectOgImages,
} from "@/features/logo/logo-discover-meta";
import {
  absUrl,
  formatPreferRank,
  parseSizes,
} from "@/features/logo/logo-discover-url";

export type IconCandidate = {
  href: string;
  score: number;
  preferRank: number;
};

export {
  absUrl,
  contentTypeForExt,
  extFromContentType,
} from "@/features/logo/logo-discover-url";
export {
  collectJsonLdLogos,
  collectManifestHref,
  collectOgImages,
  parseManifestIconUrls,
} from "@/features/logo/logo-discover-meta";

export function collectLinkIcons(html: string, baseUrl: string): IconCandidate[] {
  const out: IconCandidate[] = [];
  const re = /<link\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const rel = /rel\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase() ?? "";
    const href = /href\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href) continue;

    const sizes = /sizes\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    const typeAttr = /type\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] ?? "";
    const absolute = absUrl(href, baseUrl);
    if (!absolute) continue;

    const isApple =
      rel.includes("apple-touch-icon") ||
      rel.includes("apple-touch-icon-precomposed");
    const isIcon =
      rel.split(/\s+/).includes("icon") ||
      rel.includes("shortcut icon") ||
      rel === "shortcut icon";

    if (!isApple && !isIcon) continue;

    const sizeScore = parseSizes(sizes) || (isApple ? 180 * 180 : 32 * 32);
    const prefer = isApple ? 10 : formatPreferRank(href, typeAttr);
    out.push({ href: absolute, score: sizeScore, preferRank: prefer });
  }
  return out;
}

/**
 * Preference: JSON-LD Organization.logo → apple-touch → (manifest via
 * discoverLogoCandidatesAsync) → og:image → other icons → favicon last.
 */
export function pickBestIcon(
  html: string,
  baseUrl: string,
  domain: string,
  manifestIcons: string[] = [],
): string[] {
  const ordered: string[] = [];
  const push = (url: string | null | undefined) => {
    if (url && !ordered.includes(url)) ordered.push(url);
  };

  for (const u of collectJsonLdLogos(html, baseUrl)) push(u);

  const icons = collectLinkIcons(html, baseUrl);
  const apple = icons
    .filter((i) => i.preferRank >= 10)
    .sort((a, b) => b.score - a.score || b.preferRank - a.preferRank);
  for (const c of apple) push(c.href);

  for (const u of manifestIcons) push(u);
  for (const u of collectOgImages(html, baseUrl)) push(u);

  const regular = icons
    .filter((i) => i.preferRank < 10)
    .sort((a, b) => b.preferRank - a.preferRank || b.score - a.score);
  for (const c of regular) push(c.href);

  push(`https://${domain}/favicon.ico`);
  return ordered;
}
