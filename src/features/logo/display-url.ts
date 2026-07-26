import { extractDomain } from "@/features/verification/domain";

/** Tiny site icons — fine in workspace switcher, bad in partner circles/walls. */
export function isFaviconLogoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return (
    u.includes("favicon") ||
    u.includes("google.com/s2/favicons") ||
    u.includes("icons.duckduckgo.com") ||
    /\/favicon\.(ico|png)/.test(u)
  );
}

/**
 * Best URL to show a company mark in UI.
 * Prefers stored logo; optionally falls back to a website favicon.
 * Partners / logo walls: pass `allowFavicon: false` (initials instead).
 * Workspace switcher: leave default true so added firms are recognizable.
 */
export function companyDisplayLogoUrl(input: {
  logoUrl?: string | null;
  website?: string | null;
  logoSource?: string | null;
  /** Default true (workspace). Partners/walls must set false. */
  allowFavicon?: boolean;
}): string | null {
  if (input.logoSource === "cleared") return null;

  const allowFavicon = input.allowFavicon !== false;
  const stored = input.logoUrl?.trim();
  if (stored) {
    if (allowFavicon || !isFaviconLogoUrl(stored)) return stored;
    return null;
  }

  if (!allowFavicon) return null;

  const domain = extractDomain(input.website ?? "");
  if (!domain) return null;

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

/** Extra favicon candidates if the primary display URL fails to load. */
export function faviconFallbackUrls(website?: string | null): string[] {
  const domain = extractDomain(website ?? "");
  if (!domain) return [];
  return [
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
    `https://${domain}/favicon.ico`,
  ];
}
