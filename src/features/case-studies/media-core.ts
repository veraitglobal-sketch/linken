import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export const CASE_STUDY_MEDIA = {
  BUCKET: "case-study-media",
  MAX_BYTES: 8 * 1024 * 1024,
  MAX_GALLERY: 8,
} as const;

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function extFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function validateCaseStudyImage(
  bytes: Uint8Array,
  contentType: string,
): string | null {
  if (bytes.byteLength === 0) return "Image is empty.";
  if (bytes.byteLength > CASE_STUDY_MEDIA.MAX_BYTES) {
    return "Image must be under 8MB.";
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
    return "Use JPG, PNG, or WEBP.";
  }
  return null;
}

async function loadCaseById(
  admin: SupabaseClient,
  companyId: string,
  caseStudyId: string,
) {
  const { data, error } = await admin
    .from("case_studies")
    .select("id, slug, gallery_urls")
    .eq("id", caseStudyId)
    .eq("company_id", companyId)
    .maybeSingle();
  if (error || !data) return null;
  return data as { id: string; slug: string; gallery_urls: string[] | null };
}

export async function uploadCaseStudyCoverCore(
  admin: SupabaseClient,
  input: {
    companyId: string;
    caseStudyId: string;
    bytes: Uint8Array;
    contentType: string;
  },
): Promise<CoreResult<{ cover_image_url: string }>> {
  const invalid = validateCaseStudyImage(input.bytes, input.contentType);
  if (invalid) return { ok: false, error: invalid };

  const row = await loadCaseById(admin, input.companyId, input.caseStudyId);
  if (!row) return { ok: false, error: "Case study not found." };

  const path = `${input.companyId}/${row.id}/cover.${extFor(input.contentType)}`;
  const { error: uploadError } = await admin.storage
    .from(CASE_STUDY_MEDIA.BUCKET)
    .upload(path, input.bytes, { upsert: true, contentType: input.contentType });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data: pub } = admin.storage.from(CASE_STUDY_MEDIA.BUCKET).getPublicUrl(path);
  const coverUrl = `${pub.publicUrl}?t=${Date.now()}`;

  const { error } = await admin
    .from("case_studies")
    .update({ cover_image_url: coverUrl })
    .eq("id", row.id);
  if (error) return { ok: false, error: error.message };

  return { ok: true, data: { cover_image_url: coverUrl } };
}

export async function clearCaseStudyCoverCore(
  admin: SupabaseClient,
  companyId: string,
  caseStudyId: string,
): Promise<CoreResult<{ cleared: true }>> {
  const row = await loadCaseById(admin, companyId, caseStudyId);
  if (!row) return { ok: false, error: "Case study not found." };

  const { error } = await admin
    .from("case_studies")
    .update({ cover_image_url: null })
    .eq("id", row.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { cleared: true } };
}

export async function addCaseStudyGalleryCore(
  admin: SupabaseClient,
  input: {
    companyId: string;
    caseStudyId: string;
    images: { bytes: Uint8Array; contentType: string }[];
  },
): Promise<CoreResult<{ gallery_urls: string[]; added: string[] }>> {
  if (input.images.length === 0) {
    return { ok: false, error: "At least one image is required." };
  }

  const row = await loadCaseById(admin, input.companyId, input.caseStudyId);
  if (!row) return { ok: false, error: "Case study not found." };

  const existing = row.gallery_urls ?? [];
  if (existing.length + input.images.length > CASE_STUDY_MEDIA.MAX_GALLERY) {
    return {
      ok: false,
      error: `Gallery max ${CASE_STUDY_MEDIA.MAX_GALLERY} images.`,
    };
  }

  const added: string[] = [];
  for (let i = 0; i < input.images.length; i++) {
    const img = input.images[i]!;
    const invalid = validateCaseStudyImage(img.bytes, img.contentType);
    if (invalid) return { ok: false, error: invalid };

    const path = `${input.companyId}/${row.id}/gallery-${Date.now()}-${i}.${extFor(img.contentType)}`;
    const { error: uploadError } = await admin.storage
      .from(CASE_STUDY_MEDIA.BUCKET)
      .upload(path, img.bytes, { contentType: img.contentType });
    if (uploadError) return { ok: false, error: uploadError.message };

    const { data: pub } = admin.storage.from(CASE_STUDY_MEDIA.BUCKET).getPublicUrl(path);
    added.push(pub.publicUrl);
  }

  const gallery_urls = [...existing, ...added];
  const { error } = await admin
    .from("case_studies")
    .update({ gallery_urls })
    .eq("id", row.id);
  if (error) return { ok: false, error: error.message };

  return { ok: true, data: { gallery_urls, added } };
}

export async function removeCaseStudyGalleryCore(
  admin: SupabaseClient,
  input: { companyId: string; caseStudyId: string; url: string },
): Promise<CoreResult<{ gallery_urls: string[] }>> {
  const row = await loadCaseById(admin, input.companyId, input.caseStudyId);
  if (!row) return { ok: false, error: "Case study not found." };

  const existing = row.gallery_urls ?? [];
  const gallery_urls = existing.filter((item) => item !== input.url);
  if (gallery_urls.length === existing.length) {
    return { ok: false, error: "Image not found in gallery." };
  }

  const { error } = await admin
    .from("case_studies")
    .update({ gallery_urls })
    .eq("id", row.id);
  if (error) return { ok: false, error: error.message };

  return { ok: true, data: { gallery_urls } };
}
