import { absUrl } from "@/features/logo/logo-discover-url";

export function collectJsonLdLogos(html: string, baseUrl: string): string[] {
  const out: string[] = [];
  const re =
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      walkJsonLd(JSON.parse(m[1] ?? "") as unknown, baseUrl, out);
    } catch {
      /* ignore */
    }
  }
  return out;
}

function walkJsonLd(node: unknown, baseUrl: string, out: string[]) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const item of node) walkJsonLd(item, baseUrl, out);
    return;
  }
  if (typeof node !== "object") return;
  const o = node as Record<string, unknown>;
  const type = o["@type"];
  const types = Array.isArray(type)
    ? type.map(String)
    : type
      ? [String(type)]
      : [];
  const isOrg = types.some((t) =>
    /organization|corporation|localbusiness|brand/i.test(t),
  );
  if (isOrg && o.logo != null) pushLogoField(o.logo, baseUrl, out);
  if (o["@graph"]) walkJsonLd(o["@graph"], baseUrl, out);
  for (const v of Object.values(o)) {
    if (v && typeof v === "object") walkJsonLd(v, baseUrl, out);
  }
}

function pushLogoField(logo: unknown, baseUrl: string, out: string[]) {
  if (typeof logo === "string") {
    const abs = absUrl(logo, baseUrl);
    if (abs && !out.includes(abs)) out.push(abs);
    return;
  }
  if (logo && typeof logo === "object" && !Array.isArray(logo)) {
    const url = (logo as Record<string, unknown>).url;
    if (typeof url === "string") {
      const abs = absUrl(url, baseUrl);
      if (abs && !out.includes(abs)) out.push(abs);
    }
  }
}

export function collectOgImages(html: string, baseUrl: string): string[] {
  const out: string[] = [];
  const re = /<meta\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const prop =
      /property\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase() ??
      /name\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase() ??
      "";
    if (prop !== "og:image" && prop !== "twitter:image") continue;
    const content = /content\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (!content) continue;
    const abs = absUrl(content, baseUrl);
    if (abs && !out.includes(abs)) out.push(abs);
  }
  return out;
}

export function collectManifestHref(
  html: string,
  baseUrl: string,
): string | null {
  const re = /<link\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const rel = /rel\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase() ?? "";
    if (!rel.split(/\s+/).includes("manifest")) continue;
    const href = /href\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href) continue;
    return absUrl(href, baseUrl);
  }
  return null;
}

export function parseManifestIconUrls(
  json: string,
  baseUrl: string,
): string[] {
  try {
    const data = JSON.parse(json) as { icons?: unknown };
    if (!Array.isArray(data.icons)) return [];
    const out: string[] = [];
    for (const icon of data.icons) {
      if (!icon || typeof icon !== "object") continue;
      const src = (icon as { src?: unknown }).src;
      if (typeof src !== "string") continue;
      const abs = absUrl(src, baseUrl);
      if (abs && !out.includes(abs)) out.push(abs);
    }
    return out;
  } catch {
    return [];
  }
}
