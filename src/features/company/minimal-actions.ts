"use server";

import { redirect } from "next/navigation";
import { insertMinimalOwnedCompany } from "@/features/company/create-minimal";
import { createClient } from "@/lib/supabase/server";

/** Minimal company create for client-confirm flow (not full onboarding). */
export async function createMinimalCompany(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const next = String(formData.get("next") ?? "/dashboard").trim();
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(safeNext)}`);
  }

  let logoUrl: string | null = null;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const path = `${user.id}/${Date.now()}-${logo.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    const { error: uploadError } = await supabase.storage
      .from("company-logos")
      .upload(path, logo, { upsert: true });
    if (!uploadError) {
      const { data } = supabase.storage.from("company-logos").getPublicUrl(path);
      logoUrl = data.publicUrl;
    }
  }

  const created = await insertMinimalOwnedCompany(
    supabase,
    user.id,
    name,
    logoUrl,
  );
  if (!created.ok) {
    redirect(`${safeNext}?error=${encodeURIComponent(created.error)}`);
  }
  redirect(safeNext);
}
