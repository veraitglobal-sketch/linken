import {
  AUTH_HOSTS,
  CANONICAL_ORIGIN,
  PUBLIC_HOST,
  asOrigin,
  asPublicOrigin,
  authHost,
  isDeployedRuntime,
  isLocalhostOrigin,
} from "@/lib/site-origin";

export { CANONICAL_ORIGIN, asPublicOrigin };

/**
 * Public origin for metadata / embeds.
 * Never returns *.vercel.app — brand domain only when deployed.
 */
function resolvePublicOrigin(): string {
  const authSite = process.env.AUTH_SITE_URL?.trim();
  if (authSite && !isLocalhostOrigin(authSite)) {
    const host = authHost(authSite);
    if (host && !host.endsWith(".vercel.app")) {
      return asOrigin(authSite);
    }
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && !(isDeployedRuntime() && isLocalhostOrigin(configured))) {
    const host = authHost(configured);
    if (host && !host.endsWith(".vercel.app")) {
      return asOrigin(configured);
    }
  }

  if (isDeployedRuntime()) {
    return CANONICAL_ORIGIN;
  }

  return "http://localhost:3000";
}

/**
 * Canonical public origin for emails, embeds, sitemap, API links, and metadata.
 * Never returns localhost on deployed runtimes; never returns *.vercel.app previews.
 */
export function getSiteUrl() {
  const origin = resolvePublicOrigin();
  if (isDeployedRuntime() && isLocalhostOrigin(origin)) {
    return CANONICAL_ORIGIN;
  }
  return asPublicOrigin(origin);
}

/**
 * Auth + email magic links — always our domain (hansala.com), never *.vercel.app.
 * Locally: localhost. Deployed: only hansala.com / www.hansala.com.
 */
export function getAuthSiteUrl() {
  if (!isDeployedRuntime()) {
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (configured && isLocalhostOrigin(configured)) {
      return asOrigin(configured);
    }
    return "http://localhost:3000";
  }

  const authSite = process.env.AUTH_SITE_URL?.trim();
  if (authSite) {
    const host = authHost(authSite);
    if (host && AUTH_HOSTS.has(host)) {
      return asOrigin(authSite);
    }
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    const host = authHost(configured);
    if (host && AUTH_HOSTS.has(host)) {
      return asOrigin(configured);
    }
  }

  return CANONICAL_ORIGIN;
}

/**
 * Origin for outbound email links (Resend).
 */
export function getEmailSiteUrl() {
  const origin = getAuthSiteUrl();
  if (
    isLocalhostOrigin(origin) &&
    (process.env.RESEND_API_KEY?.trim() || isDeployedRuntime())
  ) {
    return CANONICAL_ORIGIN;
  }
  return asPublicOrigin(origin);
}

/** Same as getSiteUrl — kept for /developers and docs call sites. */
export function getDocsSiteUrl() {
  const origin = getSiteUrl();
  return origin === "http://localhost:3000" ? CANONICAL_ORIGIN : origin;
}

/** Public company profile path — always /c/{slug}. */
export function companyProfilePath(slug: string) {
  return `/c/${slug}`;
}

/** Host + path prefix for shareable address display (no protocol, no trailing slug). */
export const COMPANY_SHARE_PREFIX = "hansala.com/c";

/** Display label for shareable address (no protocol). */
export function companyShareLabel(slug: string) {
  return `${COMPANY_SHARE_PREFIX}/${slug}`;
}

/** Hostname for share UI (never throws). */
export function getPublicHost() {
  try {
    return new URL(getSiteUrl()).host;
  } catch {
    return PUBLIC_HOST;
  }
}
