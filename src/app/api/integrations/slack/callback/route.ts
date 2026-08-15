import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { exchangeSlackCode } from "@/features/slack/oauth";
import { verifySlackInstallState } from "@/features/slack/install-state";
import {
  encodeSlackPending,
  SLACK_PENDING_COOKIE,
  slackPendingCookieOptions,
} from "@/features/slack/pending-cookie";
import { upsertCompanySlack } from "@/features/slack/queries";
import { verifySchedulingState } from "@/features/scheduling/oauth-state";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

function back(query: string) {
  return NextResponse.redirect(
    new URL(`/dashboard/integrations?${query}`, getSiteUrl()),
    302,
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return back(
      `error=${encodeURIComponent("Slack connection was cancelled.")}`,
    );
  }
  if (!code || !state) {
    return back(`error=${encodeURIComponent("Missing Slack authorization.")}`);
  }

  if (verifySlackInstallState(state)) {
    const token = await exchangeSlackCode(code);
    if ("error" in token) {
      return back(`error=${encodeURIComponent(token.error)}`);
    }
    const res = NextResponse.redirect(
      new URL(
        "/login?next=" +
          encodeURIComponent("/dashboard/integrations?slack_pending=1"),
        getSiteUrl(),
      ),
      302,
    );
    res.cookies.set(
      SLACK_PENDING_COOKIE,
      encodeSlackPending(token),
      slackPendingCookieOptions(),
    );
    return res;
  }

  const parsed = verifySchedulingState(state);
  if (!parsed) {
    return back(
      `error=${encodeURIComponent("Slack session expired. Try again.")}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== parsed.userId) {
    return back(
      `error=${encodeURIComponent("Sign in again to connect Slack.")}`,
    );
  }

  const token = await exchangeSlackCode(code);
  if ("error" in token) {
    return back(`error=${encodeURIComponent(token.error)}`);
  }

  const saved = await upsertCompanySlack({
    companyId: parsed.companyId,
    userId: user.id,
    teamId: token.teamId,
    teamName: token.teamName,
    channelId: token.channelId,
    channelName: token.channelName,
    webhookUrl: token.webhookUrl,
    botToken: token.botToken,
    slackUserId: token.slackUserId,
  });

  if (!saved.ok) {
    return back(`error=${encodeURIComponent(saved.error)}`);
  }

  revalidatePath("/dashboard/integrations");
  return back("connected=slack");
}
