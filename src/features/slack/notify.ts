import "server-only";

import { formatSlackWebhookBody } from "@/features/webhooks/slack-format";
import type { WebhookEventType } from "@/features/webhooks/types";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Post to the company's Slack Incoming Webhook if connected.
 * Failures are logged; they never block the product action.
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
    .select("webhook_url")
    .eq("company_id", companyId)
    .maybeSingle();

  const url = row?.webhook_url as string | undefined;
  if (!url?.startsWith("https://hooks.slack.com/")) return;

  const envelope = {
    id:
      eventId ??
      `evt_${type.replace(".", "_")}_${crypto.randomUUID().replace(/-/g, "")}`,
    type,
    created_at: new Date().toISOString(),
    data,
  };

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
    if (!res.ok) {
      console.error("[slack] delivery", res.status);
    }
  } catch (e) {
    console.error(
      "[slack] delivery",
      e instanceof Error ? e.message : "failed",
    );
  }
}
