import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeLogoWallOverride } from "@/features/widgets/settings-merge";

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set([
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

function extFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "svg";
}

/** Upload a per-wall override logo (does not mutate the partner's profile logo). */
export async function uploadWallOverrideCore(
  admin: SupabaseClient,
  input: {
    ownerCompanyId: string;
    partnerCompanyId: string;
    currentSettings: unknown;
    bytes: Uint8Array;
    contentType: string;
  },
): Promise<CoreResult<{ logo_url: string; widget_settings: Record<string, unknown> }>> {
  if (!ALLOWED.has(input.contentType)) {
    return { ok: false, error: "Use PNG, SVG, or WebP." };
  }
  if (input.bytes.byteLength === 0 || input.bytes.byteLength > MAX_BYTES) {
    return { ok: false, error: "Image must be under 2MB." };
  }

  const path = `wall/${input.ownerCompanyId}/${input.partnerCompanyId}.${extFor(input.contentType)}`;
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
  const rejectToken = crypto.randomUUID();
  const widget_settings = mergeLogoWallOverride(
    input.currentSettings,
    input.partnerCompanyId,
    { logoUrl, rejectToken },
  );

  const { error } = await admin
    .from("companies")
    .update({ widget_settings })
    .eq("id", input.ownerCompanyId);
  if (error) return { ok: false, error: error.message };

  return { ok: true, data: { logo_url: logoUrl, widget_settings } };
}

export async function storeWallOverrideFromBytes(
  admin: SupabaseClient,
  input: {
    ownerCompanyId: string;
    partnerCompanyId: string;
    currentSettings: unknown;
    image: ArrayBuffer;
    ext: string;
    uploadType: string;
  },
): Promise<CoreResult<{ logo_url: string; widget_settings: Record<string, unknown> }>> {
  const bytes = new Uint8Array(input.image);
  let contentType = input.uploadType;
  if (input.ext === "svg") contentType = "image/svg+xml";
  else if (input.ext === "png") contentType = "image/png";
  else if (input.ext === "webp") contentType = "image/webp";
  else if (input.ext === "jpg" || input.ext === "jpeg") {
    // Convert path: store jpeg as png not required — allow jpeg as override via webp type check
    // Wall upload UI only accepts PNG/SVG/WebP; refetch may yield jpeg — store as jpg in path
    contentType = "image/jpeg";
  }

  if (contentType === "image/jpeg" || contentType === "image/x-icon" || contentType === "image/gif") {
    const path = `wall/${input.ownerCompanyId}/${input.partnerCompanyId}.${input.ext === "ico" ? "ico" : input.ext === "gif" ? "gif" : "jpg"}`;
    const { error: uploadError } = await admin.storage
      .from("company-logos")
      .upload(path, bytes, {
        upsert: true,
        contentType,
        cacheControl: "3600",
      });
    if (uploadError) return { ok: false, error: uploadError.message };
    const { data: pub } = admin.storage.from("company-logos").getPublicUrl(path);
    const logoUrl = `${pub.publicUrl}?v=${Date.now()}`;
    const rejectToken = crypto.randomUUID();
    const widget_settings = mergeLogoWallOverride(
      input.currentSettings,
      input.partnerCompanyId,
      { logoUrl, rejectToken },
    );
    const { error } = await admin
      .from("companies")
      .update({ widget_settings })
      .eq("id", input.ownerCompanyId);
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { logo_url: logoUrl, widget_settings } };
  }

  return uploadWallOverrideCore(admin, {
    ownerCompanyId: input.ownerCompanyId,
    partnerCompanyId: input.partnerCompanyId,
    currentSettings: input.currentSettings,
    bytes,
    contentType,
  });
}
