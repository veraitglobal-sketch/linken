import { NextResponse } from "next/server";
import {
  calcomAuthorizeUrl,
  calcomOAuthConfigured,
} from "@/features/scheduling/calcom-oauth";
import { signSchedulingState } from "@/features/scheduling/oauth-state";
import { getSiteUrl } from "@/lib/site";
import { requireOperatorActiveCompany } from "@/features/workspace/require-operator";

export async function GET() {
  if (!calcomOAuthConfigured()) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations?error=" +
          encodeURIComponent(
            "Add CALCOM_CLIENT_ID and CALCOM_CLIENT_SECRET to enable Connect.",
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

  return NextResponse.redirect(calcomAuthorizeUrl(state));
}
