import "server-only";

import { formatSlackWebhookBody } from "@/features/webhooks/slack-format";
import type { WebhookEventType } from "@/features/webhooks/types";
import { slackBlocksFromEnvelope } from "@/features/slack/blocks";
import { postSlackChatMessage } from "@/features/slack/post-message";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Post to the company's Slack channel if connected.
 * Prefers bot + Block Kit; falls back to Incoming Webhook.
 */
export async function notifyCompanySlack(
  companyId: string,
  type: WebhookEventType,
  data: Record<string, unknown>,
  eventId?: string,
): Promise<void> {
  const admin = createAdminClient();
  if (!admin || !companyId) return;

  const { data: row } = await admin
    .from("company_slack")
    .select("webhook_url, bot_token, channel_id")
    .eq("company_id", companyId)
    .maybeSingle();

  if (!row) return;

  const envelope = {
    id:
      eventId ??
      `evt_${type.replace(".", "_")}_${crypto.randomUUID().replace(/-/g, "")}`,
    type,
    created_at: new Date().toISOString(),
    data,
  };

  const botToken = (row.bot_token as string | null)?.trim() ?? "";
  const channelId = (row.channel_id as string | null)?.trim() ?? "";
  if (botToken.startsWith("xoxb-") && channelId) {
    const { text, blocks } = slackBlocksFromEnvelope(envelope);
    const posted = await postSlackChatMessage({
      botToken,
      channelId,
      text,
      blocks,
    });
    if (posted.ok) return;
    console.error("[slack] bot post", posted.error);
  }

  const url = row.webhook_url as string | undefined;
  if (!url?.startsWith("https://hooks.slack.com/")) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Hansala-Slack/1.0",
      },
      body: formatSlackWebhookBody(envelope),
      redirect: "error",
    });
    if (!res.ok) console.error("[slack] webhook", res.status);
  } catch (e) {
    console.error(
      "[slack] webhook",
      e instanceof Error ? e.message : "failed",
    );
  }
}
