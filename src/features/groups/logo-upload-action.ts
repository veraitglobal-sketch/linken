"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function safeBack(formData: FormData, fallback = "/dashboard/group") {
  const raw = String(formData.get("back") ?? "").trim();
  return raw.startsWith("/dashboard") ? raw : fallback;
}

function dash(back: string, query: string) {
  const hashIdx = back.indexOf("#");
  const path = (hashIdx >= 0 ? back.slice(0, hashIdx) : back) || "/dashboard";
  const hash = hashIdx >= 0 ? back.slice(hashIdx) : "";
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${query}${hash}`;
}

export async function uploadGroupLogo(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const back = safeBack(formData);
  const file = formData.get("logo");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data: group } = await supabase
    .from("company_groups")
    .select("id, slug, created_by")
    .eq("id", groupId)
    .maybeSingle();

  if (!group || group.created_by !== user.id) {
    redirect(`${back}?error=${encodeURIComponent("Not allowed.")}`);
  }

  if (!(file instanceof File) || file.size === 0) {
    redirect(dash(back, `error=${encodeURIComponent("Choose an image file.")}`));
  }
  if (file.size > 1024 * 1024) {
    redirect(dash(back, `error=${encodeURIComponent("Image must be under 1MB.")}`));
  }

  const allowed = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ]);
  if (!allowed.has(file.type)) {
    redirect(
      dash(
        back,
        `error=${encodeURIComponent("Use PNG, JPEG, WebP, GIF, or SVG.")}`,
      ),
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect(
      dash(back, `error=${encodeURIComponent("Server storage is not configured.")}`),
    );
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : file.type === "image/svg+xml"
            ? "svg"
            : "jpg";

  const path = `group/${group.id}/manual-${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from("company-logos")
    .upload(path, bytes, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    redirect(dash(back, `error=${encodeURIComponent(uploadError.message)}`));
  }

  const { data: pub } = admin.storage.from("company-logos").getPublicUrl(path);
  const logoUrl = `${pub.publicUrl}?v=${Date.now()}`;

  const { error } = await admin
    .from("company_groups")
    .update({ logo_url: logoUrl, logo_source: "manual" })
    .eq("id", group.id);

  if (error) {
    redirect(dash(back, `error=${encodeURIComponent(error.message)}`));
  }

  revalidatePath(back);
  revalidatePath("/dashboard/group");
  revalidatePath(`/g/${group.slug}`);
  redirect(dash(back, "ok=group-logo-upload"));
}
