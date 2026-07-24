import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CANONICAL_ORIGIN, getAuthSiteUrl } from "@/lib/site";

function safeNextPath(value: string | null) {
  const next = (value ?? "/dashboard").trim();
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

/**
 * Post-login redirect host: only hansala.com / www / localhost.
 * If the callback somehow hit *.vercel.app, bounce to our domain.
 */
function redirectOrigin(requestUrl: string) {
  try {
    const { origin, hostname } = new URL(requestUrl);
    const host = hostname.toLowerCase();
    if (host === "hansala.com" || host === "www.hansala.com") {
      return origin;
    }
    if (host === "localhost" || host === "127.0.0.1") {
      return origin;
    }
  } catch {
    /* fall through */
  }
  return getAuthSiteUrl() || CANONICAL_ORIGIN;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const siteUrl = redirectOrigin(request.url);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${siteUrl}${next}`);
    }
  }

  return NextResponse.redirect(
    `${siteUrl}/login?error=${encodeURIComponent("Could not sign in")}`,
  );
}
