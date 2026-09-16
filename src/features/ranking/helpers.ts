import { CANONICAL_CATEGORIES } from "@/features/categories/taxonomy";
import { countryByCode } from "@/features/geo/countries";

/** Canonical categories keyed by slug — the list is small and static. */
export const CATEGORY_BY_SLUG: Record<string, { slug: string; name: string }> =
  Object.fromEntries(CANONICAL_CATEGORIES.map((c) => [c.slug, c]));

export const countryName = (code: string | null | undefined) =>
  countryByCode(code)?.name ?? null;

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
