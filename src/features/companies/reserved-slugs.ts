/**
 * Top-level App Router paths and product namespaces that must never become
 * company slugs (short URL /c collision and /{slug} redirects).
 */
const RESERVED = [
  "about",
  "account",
  "admin",
  "api",
  "auth",
  "book",
  "c",
  "changelog",
  "claim",
  "company",
  "confirm",
  "contact",
  "cookies",
  "dashboard",
  "data-deletion",
  "demo",
  "developers",
  "disclosure",
  "embed",
  "g",
  "join",
  "llms.txt",
  "login",
  "logo-wall",
  "onboarding",
  "pricing",
  "privacy",
  "report",
  "requests",
  "robots.txt",
  "search",
  "security",
  "sitemap.xml",
  "status",
  "subprocessors",
  "terms",
  "testimonial",
  "transfer",
  "use-cases",
  "verify-domain",
  "welcome",
  "www",
] as const;

const RESERVED_SET = new Set<string>(RESERVED);

export function isReservedCompanySlug(slug: string): boolean {
  const s = slug.trim().toLowerCase();
  if (!s) return true;
  if (RESERVED_SET.has(s)) return true;
  // Block multi-segment and path-like values.
  if (s.includes("/") || s.includes(".")) return true;
  return false;
}

export function reservedCompanySlugs(): readonly string[] {
  return RESERVED;
}
