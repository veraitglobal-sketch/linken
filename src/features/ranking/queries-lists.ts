import "server-only";

import { canonicalCategorySlug } from "@/features/categories/taxonomy";
import { CATEGORY_BY_SLUG, countryName } from "@/features/ranking/helpers";
import { MIN_RANKED_FOR_PAGE } from "@/features/ranking/score";
import { createPublicClient } from "@/lib/supabase/public";

export type RankedCountry = { code: string; name: string; count: number };

/** Countries that actually have ranked companies in a category, with counts. */
export async function getRankedCountries(categorySlug: string): Promise<RankedCountry[]> {
  const slug = canonicalCategorySlug(categorySlug);
  if (!slug) return [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("company_rank")
      .select("country_code, companies!inner(claimed)")
      .eq("category_slug", slug)
      .gt("points", 0)
      .not("country_code", "is", null);

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const company = Array.isArray(row.companies) ? row.companies[0] : row.companies;
      if (company && (company as { claimed?: boolean }).claimed === false) continue;
      const code = row.country_code as string;
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([code, count]) => ({ code, name: countryName(code) ?? code, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  } catch (err) {
    console.error("[ranking countries]", err);
    return [];
  }
}

/**
 * Categories that have ranked companies.
 *
 * `min` is the difference between two questions. A sector gets a public page
 * and a sitemap entry once it is a field — three companies, the default. A
 * visitor searching sectors is asking something narrower: is there anything
 * here at all? One real company is a truthful answer to that, so search passes
 * `min: 1` and the list itself says it is not a field yet.
 */
export async function listRankedCategories(
  opts: { min?: number } = {},
): Promise<{ slug: string; name: string; count: number }[]> {
  const min = Math.max(1, opts.min ?? MIN_RANKED_FOR_PAGE);
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("company_rank")
      .select("category_slug, companies!inner(claimed)")
      .gt("points", 0)
      .not("category_slug", "is", null);

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const company = Array.isArray(row.companies) ? row.companies[0] : row.companies;
      if (company && (company as { claimed?: boolean }).claimed === false) continue;
      const slug = row.category_slug as string;
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }

    return [...counts.entries()]
      .filter(([, count]) => count >= min)
      .map(([slug, count]) => {
        const canonical = canonicalCategorySlug(slug) ?? slug;
        return {
          slug: canonical,
          name: CATEGORY_BY_SLUG[canonical]?.name ?? slug,
          count,
        };
      })
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  } catch (err) {
    console.error("[ranking categories]", err);
    return [];
  }
}
