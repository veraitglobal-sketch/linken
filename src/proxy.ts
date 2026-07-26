import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

/**
 * Proxy only where session refresh may run.
 * Home, public profiles, search, etc. never hit middleware auth.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
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
