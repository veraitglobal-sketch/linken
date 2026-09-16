import "server-only";

import { canonicalCategorySlug } from "@/features/categories/taxonomy";
import { CATEGORY_BY_SLUG, countryName } from "@/features/ranking/helpers";
import { RANK_SELECT, toRankedCompany, type RankRow } from "@/features/ranking/rank-row";
import { MIN_RANKED_FOR_POSITIONS } from "@/features/ranking/score";
import { createPublicClient } from "@/lib/supabase/public";

export type { RankedCompany } from "@/features/ranking/rank-row";
export type { RankedCountry } from "@/features/ranking/queries-lists";
export {
  getRankedCountries,
  listRankedCategories,
} from "@/features/ranking/queries-lists";
export { getCategoryLeaders } from "@/features/ranking/queries-showcase";

/**
 * Reads for the ranking pages. Public, cached, confirmed rows only.
 *
 * A row is only here because two companies clicked confirm, so the list needs
 * no gate — but it does need the reason: every entry carries the counts that
 * produced its points, and a list too small to be a field carries no positions.
 */

export type RankingList = {
  categorySlug: string;
  categoryName: string;
  countryCode: string | null;
  countryName: string | null;
  companies: import("@/features/ranking/rank-row").RankedCompany[];
  total: number;
  /** Positions are only shown once the list is a real field. */
  showPositions: boolean;
};

/** One category's list, worldwide or inside a country. */
export async function getRanking(input: {
  categorySlug: string;
  countryCode?: string | null;
  city?: string | null;
  limit?: number;
}): Promise<RankingList | null> {
  const categorySlug = canonicalCategorySlug(input.categorySlug);
  const category = categorySlug ? CATEGORY_BY_SLUG[categorySlug] : undefined;
  if (!category) return null;

  try {
    const supabase = createPublicClient();
    let req = supabase
      .from("company_rank")
      .select(RANK_SELECT)
      .eq("category_slug", category.slug)
      .gt("points", 0)
      .order("points", { ascending: false })
      .order("company_id", { ascending: true })
      .limit(input.limit ?? 50);

    if (input.countryCode) req = req.eq("country_code", input.countryCode);

    const { data, error } = await req;
    if (error) {
      console.error("[ranking]", error.message);
      return null;
    }

    let companies = (data ?? [])
      .map((row) => toRankedCompany(row as unknown as RankRow))
      .filter((c): c is NonNullable<ReturnType<typeof toRankedCompany>> => c !== null);

    if (input.city) {
      const needle = input.city.trim().toLowerCase();
      companies = companies.filter((c) => c.city.trim().toLowerCase() === needle);
    }

    return {
      categorySlug: category.slug,
      categoryName: category.name,
      countryCode: input.countryCode ?? null,
      countryName: input.countryCode ? countryName(input.countryCode) : null,
      companies,
      total: companies.length,
      showPositions: companies.length >= MIN_RANKED_FOR_POSITIONS,
    };
  } catch (err) {
    console.error("[ranking]", err);
    return null;
  }
}
