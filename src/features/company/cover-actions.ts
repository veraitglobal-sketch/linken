"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { requireOperatorForCompanySlug } from "@/features/workspace/require-operator-slug";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function safeBack(raw: string, fallback = "/dashboard/settings") {
  const back = raw.trim();
  return back.startsWith("/c/") || back.startsWith("/dashboard")
    ? back
    : fallback;
}

function slugFromBack(back: string): string | null {
  const match = back.match(/^\/c\/([^/?#]+)/);
  return match?.[1] ?? null;
}

function resolveMime(file: File): string | null {
  if (file.type && ALLOWED.has(file.type)) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return null;
}

async function operatorFromForm(formData: FormData, back: string) {
  const slug =
    String(formData.get("company_slug") ?? "").trim() ||
    slugFromBack(back) ||
    "";
  if (!slug) {
    redirect(
      `${back}?error=${encodeURIComponent("Missing company. Reload the edit page.")}`,
    );
  }
  return requireOperatorForCompanySlug({ slug, loginNext: back });
}

export async function updateCompanyCover(formData: FormData) {
  const back = safeBack(String(formData.get("back") ?? ""));

  try {
    const photo = formData.get("cover");
    if (!(photo instanceof File) || photo.size === 0) {
      redirect(`${back}?error=${encodeURIComponent("Choose an image first.")}`);
    }
    if (photo.size > MAX_BYTES) {
      redirect(
        `${back}?error=${encodeURIComponent("Image must be under 8MB.")}`,
      );
    }

    const mime = resolveMime(photo);
    if (!mime) {
      redirect(
        `${back}?error=${encodeURIComponent("Use JPG, PNG, or WEBP.")}`,
      );
    }

    const { company } = await operatorFromForm(formData, back);

    const admin = createAdminClient();
    if (!admin) {
      redirect(
        `${back}?error=${encodeURIComponent("Upload is not configured.")}`,
      );
    }

    const ext =
      mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const path = `${company.id}/cover.${ext}`;

    const { error: uploadError } = await admin.storage
      .from("company-covers")
      .upload(path, photo, { upsert: true, contentType: mime });
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
    revalidatePath(`/c/${company.slug}/edit`);
    redirect(`${back}?coverUpdated=1`);
  } catch (err) {
    // redirect() throws — must rethrow or success looks like failure.
    if (isRedirectError(err)) throw err;
    console.error("[updateCompanyCover]", err);
    redirect(
      `${back}?error=${encodeURIComponent("Upload failed. Use JPG/PNG under 8MB and try again.")}`,
    );
  }
}

export async function clearCompanyCover(formData: FormData) {
  const back = safeBack(String(formData.get("back") ?? ""));

  try {
    const { company } = await operatorFromForm(formData, back);

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
    revalidatePath(`/c/${company.slug}/edit`);
    redirect(`${back}?coverCleared=1`);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("[clearCompanyCover]", err);
    redirect(
      `${back}?error=${encodeURIComponent("Could not remove cover. Try again.")}`,
    );
  }
}
