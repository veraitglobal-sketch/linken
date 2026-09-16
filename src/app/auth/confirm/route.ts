import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { CANONICAL_ORIGIN, getAuthSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

const TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function safeNext(value: string | null) {
  const next = (value ?? "/onboarding").trim();
  return next.startsWith("/") && !next.startsWith("//") ? next : "/onboarding";
}

function originFrom(requestUrl: string) {
  try {
    const { origin, hostname } = new URL(requestUrl);
    const host = hostname.toLowerCase();
    if (host === "hansala.com" || host === "www.hansala.com") return origin;
    if (host === "localhost" || host === "127.0.0.1") return origin;
  } catch {
    /* fall through */
  }
  return getAuthSiteUrl() || CANONICAL_ORIGIN;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type") ?? "";
  const next = safeNext(url.searchParams.get("next"));
  const site = originFrom(request.url);
  const fail = `${site}/login?error=${encodeURIComponent("Could not confirm email")}&next=${encodeURIComponent(next)}`;

  if (!tokenHash || !TYPES.has(rawType as EmailOtpType)) {
    return NextResponse.redirect(fail);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: rawType as EmailOtpType,
    token_hash: tokenHash,
  });
  if (error) {
    console.error("[auth/confirm]", error.message);
    return NextResponse.redirect(fail);
  }
  return NextResponse.redirect(`${site}${next}`);
}
