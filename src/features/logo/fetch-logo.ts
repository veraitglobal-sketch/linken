import "server-only";

import {
  contentTypeForExt,
  extFromContentType,
  pickBestIcon,
} from "@/features/logo/logo-discover";
import { extractDomain } from "@/features/verification/domain";
import {
  fetchCompanyBinary,
  fetchCompanySite,
} from "@/features/verification/safe-fetch";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_IMAGE_BYTES = 1024 * 1024;
const IMAGE_TIMEOUT_MS = 8_000;

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

  const stored = await downloadBestLogo(domain);
  if (!stored.ok) return stored;

  const path = `auto/${companyId}.${stored.ext}`;
  const { error: uploadError } = await admin.storage
    .from("company-logos")
    .upload(path, stored.image, {
      upsert: true,
      contentType: stored.uploadType,
      cacheControl: "3600",
    });

  if (uploadError) return { ok: false, error: uploadError.message };

  const { data: pub } = admin.storage.from("company-logos").getPublicUrl(path);
  const logoUrl = `${pub.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await admin
    .from("companies")
    .update({ logo_url: logoUrl, logo_source: "auto" })
    .eq("id", companyId)
    .or("logo_source.is.null,logo_source.eq.auto,logo_source.eq.cleared");

  if (updateError) return { ok: false, error: updateError.message };
  return { ok: true, logoUrl };
}

export async function downloadBestLogo(domain: string): Promise<
  | { ok: true; image: ArrayBuffer; ext: string; uploadType: string }
  | { ok: false; error: string }
> {
  const home = await fetchCompanySite(domain, "/");
  if (!home.ok) return { ok: false, error: home.error };

  const candidates = pickBestIcon(home.body, home.finalUrl, domain);
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
    const contentType =
      bin.contentType || (looksIco ? "image/x-icon" : "image/png");
    const ext = extFromContentType(contentType, bin.finalUrl);
    const uploadType = contentType.startsWith("image/")
      ? contentType
      : contentTypeForExt(ext);
    return { ok: true, image: bin.body, ext, uploadType };
  }

  return { ok: false, error: "No usable logo found on the website." };
}

/** Discover logo candidates for a website (no storage). Useful for tests. */
export function discoverLogoCandidates(
  html: string,
  finalUrl: string,
  domain: string,
): string[] {
  return pickBestIcon(html, finalUrl, domain);
}
