"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/slug";

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slug = toSlug(name);

  if (!name || !slug) {
    redirect("/onboarding?error=Company%20name%20is%20required");
  }

  const { error } = await supabase.from("companies").insert({
    owner_id: user.id,
    claimed: true,
    claim_token: null,
    name,
    slug,
    category,
    city,
    website,
    description,
    tagline: description.slice(0, 120),
  });

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/c/${slug}`);
}
