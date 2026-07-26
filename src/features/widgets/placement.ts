import { extractDomain } from "@/features/verification/domain";
import { getSiteUrl } from "@/lib/site";

export type PlacementKind = "owned" | "internal" | "unknown" | "foreign";

/** Strip leading www. for host comparison. */
export function stripWww(host: string): string {
  return host.trim().toLowerCase().replace(/^www\./, "");
}

/** Parse Referer → hostname, or null. */
export function hostFromReferer(referer: string | null): string | null {
  if (!referer?.trim()) return null;
  try {
    return new URL(referer).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Classify where the embed is being framed.
 * Referer is a display/analytics signal only — not authorization (CSP is).
 */
export function classifyEmbedPlacement(
  referer: string | null,
  companyWebsite: string | null | undefined,
): { kind: PlacementKind; host: string | null } {
  const rawHost = hostFromReferer(referer);
  if (!rawHost) return { kind: "unknown", host: null };

  const host = stripWww(rawHost);
  if (isInternalHost(host)) return { kind: "internal", host };

  const domain = companyWebsite ? extractDomain(companyWebsite) : null;
  if (domain && isOwnedHost(host, domain)) {
    return { kind: "owned", host };
  }

  return { kind: "foreign", host };
}

function isOwnedHost(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

function isInternalHost(host: string): boolean {
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")) {
    return true;
  }
  try {
    const siteHost = stripWww(new URL(getSiteUrl()).hostname);
    if (!siteHost) return false;
    return host === siteHost || host.endsWith(`.${siteHost}`);
  } catch {
    return false;
  }
}
