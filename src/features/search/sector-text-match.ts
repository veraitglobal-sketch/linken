import { normalizeCategoryText } from "@/features/categories/match";

/**
 * Match sector labels without treating “vera” as “veranstaltung”.
 * Multi-word prefixes (“call ce” → “call center”) are allowed.
 */
export function sectorTextMatches(haystack: string, q: string): boolean {
  const h = normalizeCategoryText(haystack);
  if (!h || q.length < 2) return false;
  if (h === q) return true;
  if (q.includes(" ")) {
    return h.startsWith(q);
  }
  return h.split(" ").some((t) => t === q);
}
