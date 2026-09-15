import "server-only";

/** Apex 308s to www; a redirect would drop Authorization on MCP calls. */
export const OAUTH_PRODUCTION_ORIGIN = "https://www.hansala.com";

/**
 * Issuer / resource origin for OAuth metadata and WWW-Authenticate.
 * Production always uses www. Locally (and Vercel previews) use the request host
 * so Claude/Inspector match the URL they opened.
 */
export function oauthIssuerOrigin(request: Request): string {
  if (process.env.VERCEL_ENV === "production") return OAUTH_PRODUCTION_ORIGIN;
  const url = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host");
  if (host) {
    const proto =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      url.protocol.replace(":", "");
    return `${proto}://${host}`;
  }
  return url.origin;
}

export function mcpResourceUrl(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/mcp`;
}

export function mcpResourceMetadataUrl(origin: string) {
  return `${origin.replace(/\/$/, "")}/.well-known/oauth-protected-resource/api/mcp`;
}
