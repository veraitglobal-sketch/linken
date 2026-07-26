/**
 * Auth routing model (Hansala):
 *
 * - Public/marketing: no session refresh in middleware → ISR/prerender stays safe
 *   when a user is signed in. Header auth is client-only (SiteHeaderAuth).
 * - App routes: middleware refreshes JWT cookies (Supabase SSR practice).
 * - Edit gates (/c/[slug]/edit): authorize in the page via getUser +
 *   is_company_operator — never via workspace cookie alone.
 */

export function needsSessionRefresh(pathname: string): boolean {
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (isCompanyEditPath(pathname)) return true;
  if (isAuthGatedPublicPath(pathname)) return true;
  if (pathname.startsWith("/api/") && !isPublicApi(pathname)) return true;
  return false;
}

/** /c/{slug}/edit and nested edit surfaces */
function isCompanyEditPath(pathname: string): boolean {
  return /^\/c\/[^/]+\/edit(?:\/|$)/.test(pathname);
}

/** Token/invite flows that call getUser on the server */
function isAuthGatedPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith("/join/") ||
    pathname.startsWith("/claim/") ||
    pathname.startsWith("/confirm") ||
    pathname.startsWith("/partners/requests") ||
    pathname.startsWith("/transfer/") ||
    pathname.startsWith("/requests/")
  );
}

function isPublicApi(pathname: string): boolean {
  return (
    pathname.startsWith("/api/v1/agent") ||
    pathname.startsWith("/api/v1/openapi") ||
    pathname.startsWith("/api/webhooks/") ||
    pathname.startsWith("/api/badge/")
  );
}
