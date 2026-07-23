const CANONICAL_ORIGIN = "https://hansala.com";

function normalizeOrigin(value: string) {
  return value.replace(/\/$/, "");
}

function isVercelPreviewHost(host: string) {
  return host.includes(".vercel.app");
}

function isLocalhostOrigin(value: string) {
  try {
    const url = value.includes("://") ? value : `https://${value}`;
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  } catch {
    return false;
  }
}

/** True on Vercel (production, preview, or CI build). */
function isDeployedRuntime() {
  return (
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview"
  );
}

/**
 * Canonical public origin for emails, embeds, sitemap, API links, and metadata.
 * Never returns localhost on deployed runtimes; never returns *.vercel.app previews.
 */
export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const configuredOk =
    configured && !(isDeployedRuntime() && isLocalhostOrigin(configured));

  if (configuredOk) {
    return normalizeOrigin(configured!);
  }

  const vercelHost = process.env.VERCEL_URL?.trim()?.replace(/^https?:\/\//, "");
  if (vercelHost && !isVercelPreviewHost(vercelHost)) {
    return `https://${vercelHost}`;
  }

  if (
    process.env.VERCEL_ENV === "production" ||
    (vercelHost && isVercelPreviewHost(vercelHost)) ||
    isDeployedRuntime()
  ) {
    return CANONICAL_ORIGIN;
  }

  return "http://localhost:3000";
}

/**
 * Origin for outbound email links — never localhost when Resend is configured.
 * Prevents confirm/claim URLs pointing at dev server when testing mail locally.
 */
export function getEmailSiteUrl() {
  const origin = getSiteUrl();
  if (
    isLocalhostOrigin(origin) &&
    process.env.RESEND_API_KEY?.trim()
  ) {
    return CANONICAL_ORIGIN;
  }
  return origin;
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
