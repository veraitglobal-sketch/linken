import { getDomain } from "tldts";
import { extractDomain } from "@/features/verification/domain";

/** Website host plus every parent down to registrable domain (eTLD+1). */
export function allowedEmailDomainsForWebsite(website: string): string[] {
  const host = extractDomain(website);
  if (!host) return [];

  const registrable =
    getDomain(host, { allowPrivateDomains: true }) ?? host;
  const out: string[] = [];
  let current = host;

  while (true) {
    out.push(current);
    if (current === registrable) break;
    const dot = current.indexOf(".");
    if (dot < 0) break;
    current = current.slice(dot + 1);
  }

  return out;
}

/** Registrable domain for manual-entry suffix lock. */
export function lockDomainForWebsite(website: string): string | null {
  const allowed = allowedEmailDomainsForWebsite(website);
  return allowed.length > 0 ? allowed[allowed.length - 1]! : null;
}
