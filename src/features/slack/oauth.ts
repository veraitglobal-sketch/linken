import "server-only";

import { schedulingOAuthOrigin } from "@/features/scheduling/oauth-origin";

export function slackOAuthConfigured(): boolean {
  return Boolean(
    process.env.SLACK_CLIENT_ID?.trim() &&
      process.env.SLACK_CLIENT_SECRET?.trim(),
  );
}

export function slackRedirectUri(): string {
  return `${schedulingOAuthOrigin()}/api/integrations/slack/callback`;
}

/** User picks their workspace + channel; Slack returns an Incoming Webhook URL.
 * Do not pass `team` — omitting it lets users with multiple workspaces choose.
 * The Hansala Slack app must have Public Distribution activated, or only the
 * development workspace (e.g. Vera) can install. */
export function slackAuthorizeUrl(state: string): string {
  const clientId = process.env.SLACK_CLIENT_ID!.trim();
  const params = new URLSearchParams({
    client_id: clientId,
    scope: "incoming-webhook",
    redirect_uri: slackRedirectUri(),
    state,
  });
  return `https://slack.com/oauth/v2/authorize?${params}`;
}

export type SlackOAuthResult = {
  teamId: string;
  teamName: string;
  channelId: string;
  channelName: string;
  webhookUrl: string;
};

export async function exchangeSlackCode(
  code: string,
): Promise<SlackOAuthResult | { error: string }> {
  const clientId = process.env.SLACK_CLIENT_ID?.trim();
  const clientSecret = process.env.SLACK_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { error: "Slack OAuth is not configured." };
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: slackRedirectUri(),
  });

  const res = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    return { error: "Could not complete Slack login." };
  }

  const json = (await res.json()) as {
    ok?: boolean;
    error?: string;
    team?: { id?: string; name?: string };
    incoming_webhook?: {
      url?: string;
      channel?: string;
      channel_id?: string;
    };
  };

  if (!json.ok) {
    return { error: json.error || "Slack authorization failed." };
  }

  const webhookUrl = json.incoming_webhook?.url?.trim() ?? "";
  const teamId = json.team?.id?.trim() ?? "";
  if (!webhookUrl.startsWith("https://hooks.slack.com/") || !teamId) {
    return {
      error: "Slack did not return a channel webhook. Try Connect again.",
    };
  }

  return {
    teamId,
    teamName: json.team?.name?.trim() ?? "",
    channelId: json.incoming_webhook?.channel_id?.trim() ?? "",
    channelName: (json.incoming_webhook?.channel ?? "").replace(/^#/, ""),
    webhookUrl,
  };
}
