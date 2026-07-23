import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function extFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function validateCompanyCoverImage(
  bytes: Uint8Array,
  contentType: string,
): string | null {
  if (bytes.byteLength === 0) return "Image is empty.";
  if (bytes.byteLength > MAX_BYTES) return "Image must be under 8MB.";
  if (!ALLOWED.has(contentType)) return "Use JPG, PNG, or WEBP.";
  return null;
}

export async function uploadCompanyCoverCore(
  admin: SupabaseClient,
  input: { companyId: string; bytes: Uint8Array; contentType: string },
): Promise<CoreResult<{ cover_image_url: string }>> {
  const invalid = validateCompanyCoverImage(input.bytes, input.contentType);
  if (invalid) return { ok: false, error: invalid };

  const path = `${input.companyId}/cover.${extFor(input.contentType)}`;
  const { error: uploadError } = await admin.storage
    .from("company-covers")
    .upload(path, input.bytes, { upsert: true, contentType: input.contentType });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data: pub } = admin.storage.from("company-covers").getPublicUrl(path);
  const coverUrl = `${pub.publicUrl}?t=${Date.now()}`;

  const { error } = await admin
    .from("companies")
    .update({ cover_image_url: coverUrl })
    .eq("id", input.companyId);
  if (error) return { ok: false, error: error.message };

  return { ok: true, data: { cover_image_url: coverUrl } };
}

export async function clearCompanyCoverCore(
  admin: SupabaseClient,
  companyId: string,
): Promise<CoreResult<{ cleared: true }>> {
  const { error } = await admin
    .from("companies")
    .update({ cover_image_url: null })
    .eq("id", companyId);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { cleared: true } };
}
