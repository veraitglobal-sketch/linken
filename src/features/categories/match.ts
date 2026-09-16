import {
  CANONICAL_CATEGORIES,
  CATEGORY_ALIASES,
} from "@/features/categories/taxonomy";
import { applyCategorySpelling } from "@/features/categories/spelling";

const LEGAL_SUFFIXES = new Set([
  "gmbh",
  "ag",
  "kg",
  "ug",
  "ek",
  "e.k",
  "ltd",
  "llc",
  "inc",
  "plc",
  "bv",
  "nv",
  "oy",
  "ab",
  "as",
  "spa",
  "srl",
  "sarl",
  "pty",
  "ltda",
  "doo",
  "d.o.o",
  "d.o.o.",
  "ad",
  "a.d",
  "a.d.",
  "co",
  "co.",
]);

export type CategoryMatch = { slug: string; confidence: "alias" | "normalized" | "token" };

const NAME_BY_SLUG = new Map(CANONICAL_CATEGORIES.map((c) => [c.slug, c.name]));

function fold(text: string) {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function stripSuffixes(normalized: string) {
  const parts = normalized.split(" ");
  while (parts.length > 1 && LEGAL_SUFFIXES.has(parts[parts.length - 1] ?? "")) {
    parts.pop();
  }
  return parts.join(" ");
}

export function normalizeCategoryText(text: string) {
  return applyCategorySpelling(stripSuffixes(fold(text)));
}

function aliasIndex() {
  const map = new Map<string, string>();
  for (const [alias, slug] of Object.entries(CATEGORY_ALIASES)) {
    map.set(normalizeCategoryText(alias), slug);
  }
  for (const cat of CANONICAL_CATEGORIES) {
    map.set(normalizeCategoryText(cat.name), cat.slug);
    map.set(normalizeCategoryText(cat.slug.replace(/-/g, " ")), cat.slug);
  }
  return map;
}

const ALIAS_INDEX = aliasIndex();

function tokenOverlap(input: string, candidate: string) {
  const a = new Set(input.split(" ").filter((t) => t.length >= 3));
  const b = new Set(candidate.split(" ").filter((t) => t.length >= 3));
  if (a.size === 0 || b.size === 0) return 0;
  let hit = 0;
  for (const t of a) if (b.has(t)) hit += 1;
  return hit / a.size;
}

/** Map free text to one canonical slug. Never invents a category. */
export function matchCategory(text: string): CategoryMatch | null {
  const key = normalizeCategoryText(text);
  if (!key) return null;

  const aliasHit = ALIAS_INDEX.get(key);
  if (aliasHit && NAME_BY_SLUG.has(aliasHit)) {
    const foldedName = normalizeCategoryText(NAME_BY_SLUG.get(aliasHit) ?? "");
    return { slug: aliasHit, confidence: key === foldedName ? "normalized" : "alias" };
  }

  let best: { slug: string; score: number } | null = null;
  for (const [alias, slug] of ALIAS_INDEX) {
    const score = tokenOverlap(key, alias);
    if (score < 0.5) continue;
    if (!best || score > best.score) best = { slug, score };
  }
  if (best) return { slug: best.slug, confidence: "token" };
  return null;
}

export function categoryName(slug: string) {
  return NAME_BY_SLUG.get(slug) ?? null;
}
