"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { createAdminClient } from "@/lib/supabase/admin";

function safeBack(raw: string, fallback = "/dashboard/settings") {
  const back = raw.trim();
  return back.startsWith("/c/") || back.startsWith("/dashboard")
    ? back
    : fallback;
}

const MAX_BYTES = 8 * 1024 * 1024;

export async function updateCompanyCover(formData: FormData) {
  const back = safeBack(String(formData.get("back") ?? ""));
  const { user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(
      `${back}?error=${encodeURIComponent("Switch to a company workspace first.")}`,
    );
  }

  const photo = formData.get("cover");
  if (!(photo instanceof File) || photo.size === 0) {
    redirect(`${back}?error=${encodeURIComponent("Choose an image first.")}`);
  }
  if (photo.size > MAX_BYTES) {
    redirect(`${back}?error=${encodeURIComponent("Image must be under 8MB.")}`);
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
    redirect(`${back}?error=${encodeURIComponent("Use JPG, PNG, or WEBP.")}`);
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect(`${back}?error=${encodeURIComponent("Upload is not configured.")}`);
  }

  const ext =
    photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
  const path = `${company.id}/cover.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("company-covers")
    .upload(path, photo, { upsert: true, contentType: photo.type });
  if (uploadError) {
    redirect(`${back}?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { data: pub } = admin.storage.from("company-covers").getPublicUrl(path);
  const coverUrl = `${pub.publicUrl}?t=${Date.now()}`;

  const { error: dbError } = await admin
    .from("companies")
    .update({ cover_image_url: coverUrl })
    .eq("id", company.id);
  if (dbError) {
    redirect(`${back}?error=${encodeURIComponent(dbError.message)}`);
  }

  revalidatePath(back);
  revalidatePath(`/c/${company.slug}`);
  redirect(`${back}?coverUpdated=1`);
}

export async function clearCompanyCover(formData: FormData) {
  const back = safeBack(String(formData.get("back") ?? ""));
  const { user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(
      `${back}?error=${encodeURIComponent("Switch to a company workspace first.")}`,
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect(`${back}?error=${encodeURIComponent("Not configured.")}`);
  }

  const { error } = await admin
    .from("companies")
    .update({ cover_image_url: null })
    .eq("id", company.id);
  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(back);
  revalidatePath(`/c/${company.slug}`);
  redirect(`${back}?coverCleared=1`);
}
