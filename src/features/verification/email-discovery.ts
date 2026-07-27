import {
  emailLocalPart,
  isRoleEmailAddress,
  ROLE_EMAIL_LOCALS,
} from "@/features/verification/domain-role";
import {
  allowedEmailDomainsForWebsite,
  lockDomainForWebsite,
} from "@/features/verification/domain-allowed";
import {
  emailDomain,
  extractDomain,
  isPublicEmailProvider,
  normalizeDomain,
} from "@/features/verification/domain";
import {
  collectJsonLdEmails,
  collectMailtoEmails,
} from "@/features/verification/email-discovery-parse";
import { fetchCompanySite } from "@/features/verification/safe-fetch";

const CRAWL_PATHS = [
  "/impressum",
  "/",
  "/kontakt",
  "/contact",
  "/imprint",
  "/legal",
  "/about",
] as const;

const CACHE_TTL_MS = 10 * 60 * 1000;

type CacheEntry = { at: number; emails: string[] };
const discoveryCache = new Map<string, CacheEntry>();

export type DiscoveredEmail = {
  email: string;
  role: boolean;
  personal: boolean;
};

function rankEmail(email: string): number {
  const local = emailLocalPart(email) ?? "";
  const idx = ROLE_EMAIL_LOCALS.indexOf(
    local as (typeof ROLE_EMAIL_LOCALS)[number],
  );
  return idx >= 0 ? idx : ROLE_EMAIL_LOCALS.length;
}

export function filterDiscoveredEmails(
  website: string,
  raw: string[],
  roleOnly: boolean,
): DiscoveredEmail[] {
  const allowed = new Set(
    allowedEmailDomainsForWebsite(website).flatMap((d) => [d, `www.${d}`]),
  );
  const seen = new Set<string>();
  const out: DiscoveredEmail[] = [];

  for (const item of raw) {
    const email = item.trim().toLowerCase();
    const domain = normalizeDomain(emailDomain(email) ?? "");
    if (!domain || !allowed.has(domain) || isPublicEmailProvider(domain)) {
      continue;
    }
    if (seen.has(email)) continue;
    seen.add(email);
    const role = isRoleEmailAddress(email);
    if (roleOnly && !role) continue;
    out.push({
      email,
      role,
      personal: !role && /^[a-z][a-z0-9]*([._-][a-z][a-z0-9]+)+$/i.test(
        emailLocalPart(email) ?? "",
      ),
    });
  }

  out.sort((a, b) => {
    const ra = rankEmail(a.email);
    const rb = rankEmail(b.email);
    if (ra !== rb) return ra - rb;
    return a.email.localeCompare(b.email);
  });
  return out;
}

async function fetchHtml(domain: string, path: string): Promise<string | null> {
  const res = await fetchCompanySite(domain, path);
  return res.ok ? res.body : null;
}

export async function discoverEmailsOnWebsite(
  website: string,
  roleOnly: boolean,
): Promise<DiscoveredEmail[]> {
  const domain = extractDomain(website);
  if (!domain) return [];

  const cacheKey = `${domain}:${roleOnly ? "role" : "all"}`;
  const cached = discoveryCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return filterDiscoveredEmails(website, cached.emails, roleOnly);
  }

  const collected: string[] = [];
  const push = (list: string[]) => {
    for (const e of list) {
      if (!collected.includes(e)) collected.push(e);
    }
  };

  const impressum = await fetchHtml(domain, "/impressum");
  if (impressum) {
    push(collectMailtoEmails(impressum));
    push(collectJsonLdEmails(impressum));
  }

  const home = await fetchHtml(domain, "/");
  if (home) {
    push(collectMailtoEmails(home));
    push(collectJsonLdEmails(home));
  }

  for (const path of CRAWL_PATHS) {
    if (path === "/" || path === "/impressum") continue;
    const html = await fetchHtml(domain, path);
    if (!html) continue;
    push(collectMailtoEmails(html));
    push(collectJsonLdEmails(html));
  }

  discoveryCache.set(cacheKey, { at: Date.now(), emails: collected });
  return filterDiscoveredEmails(website, collected, roleOnly);
}

export function manualEntryLockDomain(website: string): string | null {
  return lockDomainForWebsite(website);
}
