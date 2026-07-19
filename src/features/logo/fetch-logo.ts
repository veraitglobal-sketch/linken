import "server-only";

import { extractDomain } from "@/features/verification/domain";
import {
  fetchCompanyBinary,
  fetchCompanySite,
} from "@/features/verification/safe-fetch";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_IMAGE_BYTES = 1024 * 1024;
const IMAGE_TIMEOUT_MS = 8_000;

type IconCandidate = {
  href: string;
  score: number;
  preferRank: number;
};

function absUrl(href: string, baseUrl: string): string | null {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function parseSizes(sizes: string | undefined): number {
  if (!sizes || sizes === "any") return 0;
  let best = 0;
  for (const part of sizes.split(/\s+/)) {
    const m = /^(\d+)x(\d+)$/i.exec(part);
    if (!m) continue;
    const area = Number(m[1]) * Number(m[2]);
    if (area > best) best = area;
  }
  return best;
}

function formatPreferRank(href: string, typeAttr: string): number {
  const t = typeAttr.toLowerCase();
  const h = href.toLowerCase();
  if (t.includes("svg") || h.endsWith(".svg")) return 3;
  if (t.includes("png") || h.endsWith(".png")) return 2;
  if (t.includes("webp") || h.endsWith(".webp")) return 2;
  if (t.includes("jpeg") || t.includes("jpg") || h.endsWith(".jpg") || h.endsWith(".jpeg"))
    return 1;
  if (t.includes("icon") || h.endsWith(".ico")) return 0;
  return 1;
}

function collectLinkIcons(html: string, baseUrl: string): IconCandidate[] {
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
    out.push({
      href: absolute,
      score: sizeScore,
      preferRank: prefer,
    });
  }
  return out;
}

function pickBestIcon(html: string, baseUrl: string, domain: string): string[] {
  const icons = collectLinkIcons(html, baseUrl);
  const apple = icons
    .filter((i) => i.preferRank >= 10)
    .sort((a, b) => b.score - a.score || b.preferRank - a.preferRank);
  const regular = icons
    .filter((i) => i.preferRank < 10)
    .sort((a, b) => b.preferRank - a.preferRank || b.score - a.score);

  const ordered: string[] = [];
  for (const c of [...apple, ...regular]) {
    if (!ordered.includes(c.href)) ordered.push(c.href);
  }
  const favicon = `https://${domain}/favicon.ico`;
  if (!ordered.includes(favicon)) ordered.push(favicon);
  return ordered;
}

function extFromContentType(ct: string, url: string): string {
  if (ct.includes("svg")) return "svg";
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  if (ct.includes("gif")) return "gif";
  if (ct.includes("icon") || ct.includes("x-icon")) return "ico";
  const path = url.toLowerCase().split("?")[0] ?? "";
  if (path.endsWith(".svg")) return "svg";
  if (path.endsWith(".png")) return "png";
  if (path.endsWith(".webp")) return "webp";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "jpg";
  if (path.endsWith(".gif")) return "gif";
  if (path.endsWith(".ico")) return "ico";
  return "png";
}

function contentTypeForExt(ext: string): string {
  switch (ext) {
    case "svg":
      return "image/svg+xml";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}

export type FetchLogoResult =
  | { ok: true; logoUrl: string }
  | { ok: false; error: string; skipped?: boolean };

/**
 * Pull the best favicon/logo from the company website and store under
 * company-logos/auto/{companyId}.{ext}. Never overwrites logo_source = 'manual'.
 */
export async function fetchAndStoreCompanyLogo(
  companyId: string,
): Promise<FetchLogoResult> {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is required." };
  }

  const { data: company, error: loadError } = await admin
    .from("companies")
    .select("id, website, logo_url, logo_source")
    .eq("id", companyId)
    .maybeSingle();

  if (loadError || !company) {
    return { ok: false, error: loadError?.message ?? "Company not found." };
  }

  if (company.logo_source === "manual") {
    return { ok: false, error: "Manual logo is not overwritten.", skipped: true };
  }

  const domain = extractDomain(company.website ?? "");
  if (!domain) {
    return { ok: false, error: "Company has no valid website domain." };
  }

  const home = await fetchCompanySite(domain, "/");
  if (!home.ok) {
    return { ok: false, error: home.error };
  }

  const candidates = pickBestIcon(home.body, home.finalUrl, domain);
  let image: ArrayBuffer | null = null;
  let contentType = "";
  let finalUrl = "";

  for (const candidate of candidates) {
    const bin = await fetchCompanyBinary(domain, candidate, {
      maxBytes: MAX_IMAGE_BYTES,
      timeoutMs: IMAGE_TIMEOUT_MS,
    });
    if (!bin.ok) continue;
    const looksIco = candidate.toLowerCase().includes(".ico");
    if (
      bin.contentType &&
      !bin.contentType.startsWith("image/") &&
      !looksIco
    ) {
      continue;
    }
    image = bin.body;
    contentType = bin.contentType || (looksIco ? "image/x-icon" : "image/png");
    finalUrl = bin.finalUrl;
    break;
  }

  if (!image) {
    return { ok: false, error: "No usable logo found on the website." };
  }

  const ext = extFromContentType(contentType, finalUrl);
  const path = `auto/${companyId}.${ext}`;
  const uploadType = contentType.startsWith("image/")
    ? contentType
    : contentTypeForExt(ext);

  const { error: uploadError } = await admin.storage
    .from("company-logos")
    .upload(path, image, {
      upsert: true,
      contentType: uploadType,
      cacheControl: "3600",
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data: pub } = admin.storage.from("company-logos").getPublicUrl(path);
  const logoUrl = `${pub.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await admin
    .from("companies")
    .update({ logo_url: logoUrl, logo_source: "auto" })
    .eq("id", companyId)
    .or("logo_source.is.null,logo_source.eq.auto");

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true, logoUrl };
}

/** Discover logo candidates for a website (no storage). Useful for tests. */
export function discoverLogoCandidates(
  html: string,
  finalUrl: string,
  domain: string,
): string[] {
  return pickBestIcon(html, finalUrl, domain);
}
