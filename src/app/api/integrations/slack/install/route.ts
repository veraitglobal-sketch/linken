import { NextResponse } from "next/server";
import {
  slackAuthorizeUrl,
  slackOAuthConfigured,
} from "@/features/slack/oauth";
import { signSlackInstallState } from "@/features/slack/install-state";
import { signSchedulingState } from "@/features/scheduling/oauth-state";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { resolveActiveWorkspace } from "@/features/workspace/context";

/**
 * Direct Install URL for Slack Marketplace.
 * MUST 302 to slack.com (not Hansala login) — Slack validates that.
 */
export async function GET() {
  if (!slackOAuthConfigured()) {
    return NextResponse.redirect(
      new URL("/dashboard/integrations", getSiteUrl()),
      302,
    );
  }

  let state = signSlackInstallState();
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const workspace = await resolveActiveWorkspace();
      const companyId = workspace?.company?.id;
      if (companyId && workspace?.active?.type === "company") {
        const { data: allowed } = await supabase.rpc("is_company_operator", {
          p_company_id: companyId,
        });
        if (allowed) {
          state = signSchedulingState({ companyId, userId: user.id });
        }
      }
    }
  } catch {
    /* anonymous Marketplace / Slack crawler */
  }

  return NextResponse.redirect(slackAuthorizeUrl(state), 302);
}
