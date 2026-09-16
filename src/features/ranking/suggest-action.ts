"use server";

import { recordCategoryUnmatched } from "@/features/categories/unmatched";
import { listRankedCategories } from "@/features/ranking/queries";
import { CATEGORY_ALIASES } from "@/features/categories/aliases";
import { normalizeCategoryText } from "@/features/categories/match";
import { sectorTextMatches } from "@/features/search/sector-text-match";

export type CategorySuggestion = { slug: string; name: string; count: number };

/**
 * Categories a visitor can actually open, matched on the canonical name and on
 * the words companies type for it ("reinigung" finds Cleaning). Only sectors
 * with confirmed records appear — a suggestion that leads to an empty list is
 * worse than no suggestion.
 */
export async function suggestCategories(
  query: string,
  opts: { record?: boolean } = {},
): Promise<CategorySuggestion[]> {
  const ranked = await listRankedCategories({ min: 1 });
  const q = normalizeCategoryText(query);
  if (!q) return ranked.slice(0, 8);

  const aliasSlugs = new Set(
    Object.entries(CATEGORY_ALIASES)
      .filter(([alias]) => sectorTextMatches(alias, q))
      .map(([, slug]) => slug),
  );

  const hits = ranked.filter(
    (c) => sectorTextMatches(c.name, q) || aliasSlugs.has(c.slug),
  );

  /* Nobody typed nonsense — they named something we have no category for yet.
     Record it so we can add the alias; never guess a match for them. */
  if (opts.record !== false && hits.length === 0 && query.trim().length >= 3) {
    await recordCategoryUnmatched(query.trim());
  }

  return hits.slice(0, 8);
}
