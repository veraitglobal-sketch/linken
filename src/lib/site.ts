/**
 * Canonical public origin for emails, embeds, sitemap, and API links.
 * Set NEXT_PUBLIC_SITE_URL in production — never rely on localhost there.
 */
export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  // Vercel preview deployments expose a host when the public URL isn't set.
  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    return `https://${vercelHost.replace(/^https?:\/\//, "")}`;
  }

  if (process.env.VERCEL_ENV === "production") {
    console.error(
      "[linken] CRITICAL: NEXT_PUBLIC_SITE_URL is unset in production. " +
        "Email and embed links will incorrectly point at localhost.",
    );
  }

  return "http://localhost:3000";
}
