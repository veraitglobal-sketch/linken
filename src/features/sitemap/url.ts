/** Absolute URL on the public site origin. */
export function sitemapUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Image sitemap requires absolute https URLs. */
export function absoluteAssetUrl(siteUrl: string, asset: string | null | undefined) {
  const raw = asset?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return sitemapUrl(siteUrl, raw);
}
