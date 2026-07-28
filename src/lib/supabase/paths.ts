/**
 * Auth routing model (Hansala):
 *
 * - Marketing/ISR pages: no session refresh in middleware.
 * - Company profiles (/c/…): refresh when cookies exist — owner chrome calls
 *   getUser on the server; without refresh the header can show Sign in while
 *   the page still renders editable forms.
 * - App routes: middleware refreshes JWT cookies (Supabase SSR practice).
 * - Edit gates (/c/[slug]/edit): authorize in the page via getUser +
 *   is_company_operator — never via workspace cookie alone.
 */

export function needsSessionRefresh(pathname: string): boolean {
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname.startsWith("/c/")) return true;
  if (isAuthGatedPublicPath(pathname)) return true;
  if (pathname.startsWith("/api/") && !isPublicApi(pathname)) return true;
  return false;
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
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/webhooks/") ||
    pathname.startsWith("/api/badge/")
  );
}
