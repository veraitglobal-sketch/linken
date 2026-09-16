/** Canonical ranking categories — English names, one primary slug each. */
export type { CanonicalCategory } from "@/features/categories/taxonomy-types";
export { CATEGORY_ALIASES } from "@/features/categories/aliases";
export { CATEGORY_GROUPS } from "@/features/categories/groups";
export type { CategoryGroup } from "@/features/categories/groups";

import { TAXONOMY_BASE } from "@/features/categories/taxonomy-base";
import { TAXONOMY_EXTRA } from "@/features/categories/taxonomy-extra";
import { TAXONOMY_EXTRA_B } from "@/features/categories/taxonomy-extra-b";
import { TAXONOMY_EXTRA_C } from "@/features/categories/taxonomy-extra-c";
import type { CanonicalCategory } from "@/features/categories/taxonomy-types";

export const CANONICAL_CATEGORIES: CanonicalCategory[] = [
  ...TAXONOMY_BASE,
  ...TAXONOMY_EXTRA,
  ...TAXONOMY_EXTRA_B,
  ...TAXONOMY_EXTRA_C,
];

/** Older slugs still in URLs or the database. */
const CATEGORY_SLUG_REDIRECTS: Record<string, string> = {
  "call-centre": "call-center",
};

export function canonicalCategorySlug(raw: string): string | null {
  const slug = CATEGORY_SLUG_REDIRECTS[raw] ?? raw;
  return CANONICAL_CATEGORIES.some((c) => c.slug === slug) ? slug : null;
}

export function categoryBySlug(slug: string): CanonicalCategory | undefined {
  return CANONICAL_CATEGORIES.find((c) => c.slug === slug);
}
