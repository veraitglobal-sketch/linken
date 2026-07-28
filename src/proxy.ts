import { type NextRequest } from "next/server";
import { withEmbedFrameAncestors } from "@/features/widgets/embed-csp";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/embed/")) {
    return withEmbedFrameAncestors(request);
  }
  return updateSession(request);
}

/**
 * Proxy only where session refresh may run, plus embed CSP.
 * Home, public profiles, search, etc. never hit middleware auth.
 */
export const config = {
  matcher: [
    "/embed/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/c/:slug/edit",
    "/c/:slug/edit/:path*",
    "/join/:path*",
    "/claim/:path*",
    "/confirm",
    "/confirm/:path*",
    "/partners/requests",
    "/transfer/:path*",
    "/requests/:path*",
    "/api/((?!v1/agent|v1/openapi|health|webhooks/|badge/).*)",
  ],
};
