"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_GALLERY = 8;

function safeBack(raw: string, fallback = "/dashboard/cases") {
  const back = raw.trim();
  return back.startsWith("/dashboard") ? back : fallback;
}

function extFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function validatePhoto(photo: File) {
  if (photo.size === 0) return "Choose an image first.";
  if (photo.size > MAX_BYTES) return "Image must be under 8MB.";
  if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
    return "Use JPG, PNG, or WEBP.";
  }
  return null;
}

async function loadCase(companyId: string, caseSlug: string) {
  const admin = createAdminClient();
  if (!admin) return { error: "Upload is not configured." as const, admin: null, row: null };

  const { data: row, error } = await admin
    .from("case_studies")
    .select("id, slug, gallery_urls")
    .eq("company_id", companyId)
    .eq("slug", caseSlug)
    .maybeSingle();

  if (error || !row) return { error: "Case study not found.", admin, row: null };
  return { error: null, admin, row };
}

export async function updateCaseStudyCover(formData: FormData) {
  const back = safeBack(String(formData.get("back") ?? ""));
  const caseSlug = String(formData.get("case_slug") ?? "").trim();
  const { user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) redirect(`${back}?error=${encodeURIComponent("Switch workspace first.")}`);

  const photo = formData.get("cover");
  if (!(photo instanceof File)) {
    redirect(`${back}?error=${encodeURIComponent("Choose an image first.")}`);
  }
  const invalid = validatePhoto(photo);
  if (invalid) redirect(`${back}?error=${encodeURIComponent(invalid)}`);

  const loaded = await loadCase(company.id, caseSlug);
  if (loaded.error || !loaded.admin || !loaded.row) {
    redirect(`${back}?error=${encodeURIComponent(loaded.error ?? "Not found.")}`);
  }

  const path = `${company.id}/${loaded.row.id}/cover.${extFor(photo.type)}`;
  const { error: uploadError } = await loaded.admin.storage
    .from("case-study-media")
    .upload(path, photo, { upsert: true, contentType: photo.type });
  if (uploadError) redirect(`${back}?error=${encodeURIComponent(uploadError.message)}`);

  const { data: pub } = loaded.admin.storage.from("case-study-media").getPublicUrl(path);
  const coverUrl = `${pub.publicUrl}?t=${Date.now()}`;

  const { error: dbError } = await loaded.admin
    .from("case_studies")
    .update({ cover_image_url: coverUrl })
    .eq("id", loaded.row.id);
  if (dbError) redirect(`${back}?error=${encodeURIComponent(dbError.message)}`);

  revalidatePath(back);
  revalidatePath(`/c/${company.slug}`);
  revalidatePath(`/c/${company.slug}/case-studies/${caseSlug}`);
  redirect(`${back}?saved=1`);
}

export async function addCaseStudyGalleryPhotos(formData: FormData) {
  const back = safeBack(String(formData.get("back") ?? ""));
  const caseSlug = String(formData.get("case_slug") ?? "").trim();
  const { user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) redirect(`${back}?error=${encodeURIComponent("Switch workspace first.")}`);

  const loaded = await loadCase(company.id, caseSlug);
  if (loaded.error || !loaded.admin || !loaded.row) {
    redirect(`${back}?error=${encodeURIComponent(loaded.error ?? "Not found.")}`);
  }

  const existing = (loaded.row.gallery_urls as string[]) ?? [];
  const files = formData.getAll("gallery").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    redirect(`${back}?error=${encodeURIComponent("Choose at least one image.")}`);
  }
  if (existing.length + files.length > MAX_GALLERY) {
    redirect(`${back}?error=${encodeURIComponent(`Gallery max ${MAX_GALLERY} images.`)}`);
  }

  const added: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const photo = files[i]!;
    const invalid = validatePhoto(photo);
    if (invalid) redirect(`${back}?error=${encodeURIComponent(invalid)}`);

    const path = `${company.id}/${loaded.row.id}/gallery-${Date.now()}-${i}.${extFor(photo.type)}`;
    const { error: uploadError } = await loaded.admin.storage
      .from("case-study-media")
      .upload(path, photo, { contentType: photo.type });
    if (uploadError) redirect(`${back}?error=${encodeURIComponent(uploadError.message)}`);

    const { data: pub } = loaded.admin.storage.from("case-study-media").getPublicUrl(path);
    added.push(pub.publicUrl);
  }

  const { error: dbError } = await loaded.admin
    .from("case_studies")
    .update({ gallery_urls: [...existing, ...added] })
    .eq("id", loaded.row.id);
  if (dbError) redirect(`${back}?error=${encodeURIComponent(dbError.message)}`);

  revalidatePath(back);
  revalidatePath(`/c/${company.slug}/case-studies/${caseSlug}`);
  redirect(`${back}?saved=1`);
}

export async function clearCaseStudyCover(formData: FormData) {
  const back = safeBack(String(formData.get("back") ?? ""));
  const caseSlug = String(formData.get("case_slug") ?? "").trim();
  const { user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) redirect(`${back}?error=${encodeURIComponent("Switch workspace first.")}`);

  const loaded = await loadCase(company.id, caseSlug);
  if (loaded.error || !loaded.admin || !loaded.row) {
    redirect(`${back}?error=${encodeURIComponent(loaded.error ?? "Not found.")}`);
  }

  await loaded.admin
    .from("case_studies")
    .update({ cover_image_url: null })
    .eq("id", loaded.row.id);

  revalidatePath(back);
  revalidatePath(`/c/${company.slug}/case-studies/${caseSlug}`);
  redirect(`${back}?saved=1`);
}
