import { extractDomain } from "@/features/verification/domain";

/**
 * Best URL to show a company mark in UI.
 * Prefers stored logo; otherwise a favicon derived from the website domain.
 * When logo_source is 'cleared', never fall back to favicon.
 */
export function companyDisplayLogoUrl(input: {
  logoUrl?: string | null;
  website?: string | null;
  logoSource?: string | null;
}): string | null {
  if (input.logoSource === "cleared") return null;

  const stored = input.logoUrl?.trim();
  if (stored) return stored;

  const domain = extractDomain(input.website ?? "");
  if (!domain) return null;

  // Reliable thumbnail service for graph / list marks (client browser fetch).
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
