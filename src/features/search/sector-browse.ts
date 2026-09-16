import {
  CANONICAL_CATEGORIES,
  CATEGORY_ALIASES,
} from "@/features/categories/taxonomy";
import { matchCategory, normalizeCategoryText } from "@/features/categories/match";
import type { CategorySuggestion } from "@/features/ranking/suggest-action";
import { sectorTextMatches } from "@/features/search/sector-text-match";

type CompanyHint = { name: string; category: string };

/**
 * True when the typed text is aiming at a sector (e.g. “call center”),
 * not a concrete company name — even if ranking has no sector chip yet.
 */
export function isSectorBrowseQuery(
  query: string,
  sectors: CategorySuggestion[],
  companies: CompanyHint[] = [],
): boolean {
  const q = normalizeCategoryText(query);
  if (q.length < 2) return false;

  if (sectors.some((s) => sectorTextMatches(s.name, q))) return true;
  if (matchCategory(query)) return true;
  if (CANONICAL_CATEGORIES.some((c) => sectorTextMatches(c.name, q))) return true;
  if (Object.keys(CATEGORY_ALIASES).some((alias) => sectorTextMatches(alias, q))) {
    return true;
  }

  if (companies.length > 0) {
    const catHits = companies.filter((c) =>
      sectorTextMatches(c.category, q) ||
      (q.includes(" ") && normalizeCategoryText(c.category).startsWith(q)) ||
      (q.includes(" ") && normalizeCategoryText(c.category).includes(q)),
    ).length;
    const nameHits = companies.filter((c) =>
      normalizeCategoryText(c.name).includes(q),
    ).length;
    if (catHits > 0 && catHits >= nameHits) return true;
  }

  return false;
}
