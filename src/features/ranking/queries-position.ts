import "server-only";

import { canonicalCategorySlug } from "@/features/categories/taxonomy";
import { CATEGORY_BY_SLUG, countryName } from "@/features/ranking/helpers";
import { getRanking, type RankingList } from "@/features/ranking/queries";
import { createPublicClient } from "@/lib/supabase/public";

export type CompanyPosition = {
  categorySlug: string;
  categoryName: string;
  countryCode: string | null;
  countryName: string | null;
  worldRank: number | null;
  worldTotal: number;
  countryRank: number | null;
  countryTotal: number;
  points: number;
};

/** Where one company stands — for its profile and its dashboard. */
export async function getCompanyPositions(
  companySlug: string,
): Promise<CompanyPosition | null> {
  try {
    const supabase = createPublicClient();
    const { data: own } = await supabase
      .from("company_rank")
      .select("category_slug, country_code, points, companies!inner(slug)")
      .eq("companies.slug", companySlug)
      .maybeSingle();

    const rawSlug = (own?.category_slug as string | null) ?? null;
    if (!own || !rawSlug || Number(own.points ?? 0) <= 0) return null;

    const categorySlug = canonicalCategorySlug(rawSlug) ?? rawSlug;
    const category = CATEGORY_BY_SLUG[categorySlug];
    const countryCode = (own.country_code as string | null) ?? null;

    const [world, country] = await Promise.all([
      getRanking({ categorySlug, limit: 200 }),
      countryCode ? getRanking({ categorySlug, countryCode, limit: 200 }) : null,
    ]);

    const findRank = (list: RankingList | null) => {
      if (!list) return { rank: null as number | null, total: 0 };
      const index = list.companies.findIndex((c) => c.slug === companySlug);
      return {
        rank: index >= 0 && list.showPositions ? index + 1 : null,
        total: list.total,
      };
    };

    const w = findRank(world);
    const c = findRank(country);

    return {
      categorySlug,
      categoryName: category?.name ?? categorySlug,
      countryCode,
      countryName: countryCode ? countryName(countryCode) : null,
      worldRank: w.rank,
      worldTotal: w.total,
      countryRank: c.rank,
      countryTotal: c.total,
      points: Number(own.points ?? 0),
    };
  } catch (err) {
    console.error("[ranking position]", err);
    return null;
  }
}
