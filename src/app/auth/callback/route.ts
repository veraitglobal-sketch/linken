import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthSiteUrl } from "@/lib/site";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const siteUrl = getAuthSiteUrl();

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
