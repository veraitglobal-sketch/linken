import { NextResponse } from "next/server";
import {
  calcomAuthorizeUrl,
  calcomOAuthConfigured,
} from "@/features/scheduling/calcom-oauth";
import {
  CALCOM_PKCE_COOKIE,
  createCalcomPkce,
} from "@/features/scheduling/calcom-pkce";
import { signSchedulingState } from "@/features/scheduling/oauth-state";
import { getSiteUrl } from "@/lib/site";
import { requireOperatorActiveCompany } from "@/features/workspace/require-operator";

export async function GET() {
  if (!calcomOAuthConfigured()) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations?error=" +
          encodeURIComponent("Add CALCOM_CLIENT_ID to enable Connect."),
        getSiteUrl(),
      ),
    );
  }

  const { user, company } = await requireOperatorActiveCompany({
    loginNext: "/dashboard/integrations",
  });

  const state = signSchedulingState({
    companyId: company.id,
    userId: user.id,
  });
  const { verifier, challenge } = createCalcomPkce();

  const res = NextResponse.redirect(calcomAuthorizeUrl(state, challenge));
  res.cookies.set(CALCOM_PKCE_COOKIE, verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  return res;
}
