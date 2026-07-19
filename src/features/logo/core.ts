import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAndStoreCompanyLogo } from "@/features/logo/fetch-logo";

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const MAX_BYTES = 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function refreshLogoCore(
  admin: SupabaseClient,
  companyId: string,
): Promise<CoreResult<{ logo_url: string }>> {
  const { data: company } = await admin
    .from("companies")
    .select("id, website, logo_source")
    .eq("id", companyId)
    .maybeSingle();

  if (!company) return { ok: false, error: "Company not found." };
  if (company.logo_source === "manual") {
    return {
      ok: false,
      error: "Your uploaded logo is not replaced automatically.",
    };
  }
  if (!company.website) {
    return { ok: false, error: "Add a company website first." };
  }

  const { data: allowed, error: rateError } = await admin.rpc(
    "agent_record_logo_refresh_attempt",
    { p_company_id: companyId },
  );
  if (rateError) return { ok: false, error: rateError.message };
  if (allowed === false) {
    return { ok: false, error: "Rate limit: max 3 logo refreshes per day." };
  }

  const result = await fetchAndStoreCompanyLogo(companyId);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: { logo_url: result.logoUrl } };
}

export async function uploadLogoCore(
  admin: SupabaseClient,
  companyId: string,
  input: { bytes: Uint8Array; contentType: string; ownerUserId: string },
): Promise<CoreResult<{ logo_url: string }>> {
  if (!ALLOWED_TYPES.has(input.contentType)) {
    return {
      ok: false,
      error: "Unsupported image type. Use PNG, JPEG, WebP, GIF, or SVG.",
    };
  }
  if (input.bytes.byteLength === 0 || input.bytes.byteLength > MAX_BYTES) {
    return { ok: false, error: "Image must be between 1 byte and 1MB." };
  }

  const ext =
    input.contentType === "image/png"
      ? "png"
      : input.contentType === "image/webp"
        ? "webp"
        : input.contentType === "image/gif"
          ? "gif"
          : input.contentType === "image/svg+xml"
            ? "svg"
            : "jpg";

  const path = `${input.ownerUserId}/manual-${Date.now()}.${ext}`;
  const { error: uploadError } = await admin.storage
    .from("company-logos")
    .upload(path, input.bytes, {
      upsert: true,
      contentType: input.contentType,
      cacheControl: "3600",
    });

  if (uploadError) return { ok: false, error: uploadError.message };

  const { data: pub } = admin.storage.from("company-logos").getPublicUrl(path);
  const logoUrl = `${pub.publicUrl}?v=${Date.now()}`;

  const { error } = await admin
    .from("companies")
    .update({ logo_url: logoUrl, logo_source: "manual" })
    .eq("id", companyId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { logo_url: logoUrl } };
}
