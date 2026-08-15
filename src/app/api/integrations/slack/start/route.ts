import { NextResponse } from "next/server";
import {
  slackAuthorizeUrl,
  slackOAuthConfigured,
} from "@/features/slack/oauth";
import { signSchedulingState } from "@/features/scheduling/oauth-state";
import { getSiteUrl } from "@/lib/site";
import { requireOperatorActiveCompany } from "@/features/workspace/require-operator";

/** Start Slack OAuth from dashboard Connect — always 302 to slack.com. */
export async function GET() {
  if (!slackOAuthConfigured()) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations?error=" +
          encodeURIComponent(
            "Add SLACK_CLIENT_ID and SLACK_CLIENT_SECRET to enable Connect Slack.",
          ),
        getSiteUrl(),
      ),
      302,
    );
  }

  const { user, company } = await requireOperatorActiveCompany({
    loginNext: "/dashboard/integrations",
  });

  const state = signSchedulingState({
    companyId: company.id,
    userId: user.id,
  });

  return NextResponse.redirect(slackAuthorizeUrl(state), 302);
}
