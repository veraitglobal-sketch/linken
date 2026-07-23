const CANONICAL_ORIGIN = "https://hansala.com";

function normalizeOrigin(value: string) {
  return value.replace(/\/$/, "");
}

function isVercelPreviewHost(host: string) {
  return host.includes(".vercel.app");
}

/**
 * Canonical public origin for emails, embeds, sitemap, API links, and metadata.
 * Never returns a transient *.vercel.app preview host.
 */
export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return normalizeOrigin(configured);
  }

  const vercelHost = process.env.VERCEL_URL?.trim()?.replace(/^https?:\/\//, "");
  if (vercelHost && !isVercelPreviewHost(vercelHost)) {
    return `https://${vercelHost}`;
  }

  if (
    process.env.VERCEL_ENV === "production" ||
    (vercelHost && isVercelPreviewHost(vercelHost))
  ) {
    return CANONICAL_ORIGIN;
  }

  return "http://localhost:3000";
}

/** Same as getSiteUrl — kept for /developers and docs call sites. */
export function getDocsSiteUrl() {
  const origin = getSiteUrl();
  return origin === "http://localhost:3000" ? CANONICAL_ORIGIN : origin;
}

export { CANONICAL_ORIGIN };

/** Public company profile path — always /c/{slug}. */
export function companyProfilePath(slug: string) {
  return `/c/${slug}`;
}

/** Display label for shareable address (no protocol). */
export function companyShareLabel(slug: string) {
  return `hansala.com/${slug}`;
}
