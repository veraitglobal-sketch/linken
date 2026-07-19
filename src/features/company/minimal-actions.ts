"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/slug";

/** Minimal company create for client-confirm flow (not full onboarding). */
export async function createMinimalCompany(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const next = String(formData.get("next") ?? "/dashboard").trim();
  const safeNext = next.startsWith("/") ? next : "/dashboard";
  const slug = toSlug(name);

  if (!name || !slug) {
    redirect(`${safeNext}?error=${encodeURIComponent("Company name is required.")}`);
  }

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

  const { error } = await supabase.from("companies").insert({
    owner_id: user.id,
    claimed: true,
    claim_token: null,
    name,
    slug,
    logo_url: logoUrl,
    logo_source: logoUrl ? "manual" : null,
    tagline: "",
    description: "",
    category: "Client",
    city: "",
    website: "",
  });

  if (error) {
    redirect(`${safeNext}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(safeNext);
}
