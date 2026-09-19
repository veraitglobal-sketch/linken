import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { uniqueCompanySlug } from "@/features/partners/unique-slug";
import { setWorkspacePreference } from "@/features/workspace/set-preference";
import { toSlug } from "@/lib/slug";

export type MinimalCompany = { id: string; name: string; slug: string };

/** Reuse the oldest owned firm, or insert a claimed profile for confirm. */
export async function insertMinimalOwnedCompany(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  logoUrl?: string | null,
): Promise<{ ok: true; company: MinimalCompany } | { ok: false; error: string }> {
  const trimmed = name.trim();
  if (!trimmed || !toSlug(trimmed)) {
    return { ok: false, error: "Company name is required." };
  }

  const { data: existing } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("owner_id", userId)
    .eq("claimed", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existing) {
    await setWorkspacePreference("company", existing.id);
    return { ok: true, company: existing as MinimalCompany };
  }

  const slug = await uniqueCompanySlug(supabase, trimmed);
  const { data: created, error } = await supabase
    .from("companies")
    .insert({
      owner_id: userId,
      claimed: true,
      claim_token: null,
      name: trimmed,
      slug,
      logo_url: logoUrl ?? null,
      logo_source: logoUrl ? "manual" : null,
      tagline: "",
      description: "",
      category: "",
      city: "",
      website: "",
      organization_kind: "company",
    })
    .select("id, name, slug")
    .single();

  if (error || !created) {
    const raw = error?.message ?? "Could not create company.";
    console.error("[insertMinimalOwnedCompany]", raw);
    const message = /companies_slug_key|duplicate key/i.test(raw)
      ? "That company name is taken. Try a slightly different name."
      : raw;
    return { ok: false, error: message };
  }

  await setWorkspacePreference("company", created.id);
  return { ok: true, company: created as MinimalCompany };
}
