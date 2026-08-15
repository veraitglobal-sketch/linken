import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { exchangeSlackCode } from "@/features/slack/oauth";
import { upsertCompanySlack } from "@/features/slack/queries";
import { verifySchedulingState } from "@/features/scheduling/oauth-state";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

function back(query: string) {
  return NextResponse.redirect(
    new URL(`/dashboard/integrations?${query}`, getSiteUrl()),
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
  });

  if (!saved.ok) {
    return back(`error=${encodeURIComponent(saved.error)}`);
  }

  revalidatePath("/dashboard/integrations");
  return back("connected=slack");
}
