import { extractDomain } from "@/features/verification/domain";
import { getSiteUrl } from "@/lib/site";

/**
 * Build CSP frame-ancestors for an embed response.
 * Allows Hansala itself (dashboard preview) + the company's website / subdomains.
 */
export function buildEmbedFrameAncestors(website: string | null | undefined): string {
  const ancestors = new Set<string>(["'self'"]);

  for (const origin of siteOrigins()) {
    ancestors.add(origin);
  }

  const domain = website ? extractDomain(website) : null;
  if (domain) {
    ancestors.add(`https://${domain}`);
    ancestors.add(`https://*.${domain}`);
    // Local/dev sites sometimes still serve http
    if (process.env.NODE_ENV !== "production") {
      ancestors.add(`http://${domain}`);
      ancestors.add(`http://*.${domain}`);
    }
  }

  return `frame-ancestors ${[...ancestors].join(" ")}`;
}

function siteOrigins(): string[] {
  const out: string[] = [];
  try {
    const site = new URL(getSiteUrl());
    out.push(site.origin);
    const host = site.hostname.replace(/^www\./, "");
    if (host && host !== "localhost" && !host.endsWith(".localhost")) {
      out.push(`${site.protocol}//${host}`);
      out.push(`${site.protocol}//www.${host}`);
    }
  } catch {
    // ignore
  }
  return out;
}
