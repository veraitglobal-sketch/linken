import {
  categoryName,
  matchCategory,
  normalizeCategoryText,
} from "@/features/categories/match";
import type { CategorySuggestion } from "@/features/ranking/suggest-action";

/**
 * Sector chips to show above results. Prefer ranked suggestions; if none,
 * fall back to a taxonomy match so “call center” still shows a sector first.
 */
export function sectorChipsForQuery(
  query: string,
  ranked: CategorySuggestion[],
): CategorySuggestion[] {
  if (ranked.length > 0) return ranked;
  const hit = matchCategory(query);
  if (!hit) return [];
  const name = categoryName(hit.slug);
  if (!name) return [];
  return [{ slug: hit.slug, name, count: 0 }];
}

/** Drop the lone chip when the query already names that sector (no circular See all). */
export function visibleSectorChips(
  query: string,
  chips: CategorySuggestion[],
  sectorBrowse: boolean,
): CategorySuggestion[] {
  if (!sectorBrowse || chips.length !== 1) return chips;
  const q = normalizeCategoryText(query);
  if (normalizeCategoryText(chips[0].name) === q) return [];
  return chips;
}
