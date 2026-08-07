import type { SupabaseClient } from "@supabase/supabase-js";
import { isReservedCompanySlug } from "@/features/companies/reserved-slugs";
import { toSlug } from "@/lib/slug";

export async function uniqueCompanySlug(
  supabase: SupabaseClient,
  name: string,
) {
  const base = toSlug(name) || "company";
  let slug = isReservedCompanySlug(base) ? `${base}-co` : base;
  let n = 0;

  while (n < 50) {
    if (isReservedCompanySlug(slug)) {
      n += 1;
      slug = `${base}-${n}`;
      continue;
    }
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
