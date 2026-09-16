import "server-only";

import { canonicalCategorySlug } from "@/features/categories/taxonomy";
import { CATEGORY_BY_SLUG } from "@/features/ranking/helpers";
import { RANK_SELECT, toRankedCompany, type RankedCompany, type RankRow } from "@/features/ranking/rank-row";
import { createPublicClient } from "@/lib/supabase/public";

export type CategoryLeaders = {
  slug: string;
  name: string;
  total: number;
  leaders: RankedCompany[];
};

/**
 * Who currently leads each sector — the rotating panel on the search screen.
 *
 * One read for every category, grouped here rather than one query per sector:
 * the table is small, and a search page must not fan out into a dozen round
 * trips before it paints. A short sector is still shown — it is real — but the
 * panel drops its position numbers there, the same rule the lists use.
 */
export async function getCategoryLeaders(perCategory = 3): Promise<CategoryLeaders[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("company_rank")
      .select(RANK_SELECT)
      .gt("points", 0)
      .not("category_slug", "is", null)
      .order("points", { ascending: false })
      .order("company_id", { ascending: true })
      .limit(400);

    if (error) {
      console.error("[ranking leaders]", error.message);
      return [];
    }

    const groups = new Map<string, CategoryLeaders>();
    for (const raw of data ?? []) {
      const row = raw as unknown as RankRow;
      const slug = canonicalCategorySlug(row.category_slug ?? "") ?? null;
      if (!slug) continue;
      const company = toRankedCompany(row);
      if (!company) continue;
      const group = groups.get(slug) ?? {
        slug,
        name: CATEGORY_BY_SLUG[slug]?.name ?? slug,
        total: 0,
        leaders: [],
      };
      group.total += 1;
      if (group.leaders.length < perCategory) group.leaders.push(company);
      groups.set(slug, group);
    }

    return [...groups.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  } catch (err) {
    console.error("[ranking leaders]", err);
    return [];
  }
}
