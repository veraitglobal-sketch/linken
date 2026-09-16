import {
  CANONICAL_CATEGORIES,
  CATEGORY_ALIASES,
} from "@/features/categories/taxonomy";
import type { CanonicalCategory } from "@/features/categories/taxonomy-types";
import { normalizeCategoryText } from "@/features/categories/match";

type SearchRow = {
  cat: CanonicalCategory;
  keys: string[];
};

function buildRows(): SearchRow[] {
  const aliasesBySlug = new Map<string, string[]>();
  for (const [alias, slug] of Object.entries(CATEGORY_ALIASES)) {
    const list = aliasesBySlug.get(slug) ?? [];
    list.push(normalizeCategoryText(alias));
    aliasesBySlug.set(slug, list);
  }
  return CANONICAL_CATEGORIES.map((cat) => {
    const keys = new Set<string>([
      normalizeCategoryText(cat.name),
      normalizeCategoryText(cat.slug.replace(/-/g, " ")),
      ...(aliasesBySlug.get(cat.slug) ?? []),
    ]);
    return { cat, keys: [...keys].filter(Boolean) };
  });
}

const ROWS = buildRows();

function tokenHit(queryTok: string, hayTok: string) {
  if (hayTok === queryTok) return 3;
  if (hayTok.startsWith(queryTok) && queryTok.length >= 2) return 2;
  if (queryTok.length >= 3 && hayTok.includes(queryTok)) return 1;
  return 0;
}

function scoreRow(query: string, row: SearchRow) {
  let best = 0;
  const qTokens = query.split(" ").filter(Boolean);
  for (const key of row.keys) {
    if (key === query) return 1000;
    if (key.startsWith(query)) best = Math.max(best, 800 - key.length);
    if (query.length >= 3 && key.includes(query)) best = Math.max(best, 500);

    const kTokens = key.split(" ").filter(Boolean);
    if (qTokens.length === 0) continue;
    let hits = 0;
    let weight = 0;
    for (const qt of qTokens) {
      let local = 0;
      for (const kt of kTokens) local = Math.max(local, tokenHit(qt, kt));
      if (local > 0) {
        hits += 1;
        weight += local;
      }
    }
    if (hits === qTokens.length) best = Math.max(best, 400 + weight * 10);
    else if (hits > 0 && hits / qTokens.length >= 0.5) {
      best = Math.max(best, 200 + weight * 10);
    }
  }
  return best;
}

/** Ranked sector suggestions for whatever the user types. */
export function suggestCategories(
  raw: string,
  limit = 14,
): CanonicalCategory[] {
  const query = normalizeCategoryText(raw);
  if (!query) return [];

  const ranked = ROWS.map((row) => ({
    cat: row.cat,
    score: scoreRow(query, row),
  }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.cat.name.localeCompare(b.cat.name));

  const out: CanonicalCategory[] = [];
  const seen = new Set<string>();
  for (const r of ranked) {
    if (seen.has(r.cat.slug)) continue;
    seen.add(r.cat.slug);
    out.push(r.cat);
    if (out.length >= limit) break;
  }
  return out;
}
