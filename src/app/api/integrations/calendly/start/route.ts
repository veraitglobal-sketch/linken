import { NextResponse } from "next/server";
import {
  calendlyAuthorizeUrl,
  calendlyOAuthConfigured,
} from "@/features/scheduling/calendly-oauth";
import { signSchedulingState } from "@/features/scheduling/oauth-state";
import { getSiteUrl } from "@/lib/site";
import { requireOperatorActiveCompany } from "@/features/workspace/require-operator";

export async function GET() {
  if (!calendlyOAuthConfigured()) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations?error=" +
          encodeURIComponent(
            "Add CALENDLY_CLIENT_ID and CALENDLY_CLIENT_SECRET to enable Connect.",
          ),
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

  return NextResponse.redirect(calendlyAuthorizeUrl(state));
}
