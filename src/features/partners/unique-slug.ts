import type { SupabaseClient } from "@supabase/supabase-js";
import { toSlug } from "@/lib/slug";

export async function uniqueCompanySlug(
  supabase: SupabaseClient,
  name: string,
) {
  const base = toSlug(name) || "company";
  let slug = base;
  let n = 0;

  while (n < 50) {
    const { data } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }

  return `${base}-${Date.now().toString(36)}`;
}
