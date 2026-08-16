import "server-only";

import { after } from "next/server";
import { attemptDelivery } from "@/features/webhooks/deliver";
import {
  WEBHOOK_EVENTS,
  type WebhookEnvelope,
  type WebhookEventType,
} from "@/features/webhooks/types";
import { createAdminClient } from "@/lib/supabase/admin";

function isEvent(value: string): value is WebhookEventType {
  return (WEBHOOK_EVENTS as readonly string[]).includes(value);
}

/**
 * Queue outbound webhooks + Slack for a company. Non-blocking via `after()`.
 * No-op when no endpoints or admin client missing.
 *
 * `companyId` is the Hansala tenant key — every Slack write goes through this
 * argument, never a Slack team_id lookup.
 */
export function emitWebhookEvent(
  companyId: string,
  type: WebhookEventType,
  data: Record<string, unknown>,
  eventId?: string,
): void {
  if (!companyId || !isEvent(type)) return;

  after(async () => {
    await dispatchNow(companyId, type, data, eventId);
    const { notifyCompanySlack } = await import("@/features/slack/notify");
    await notifyCompanySlack(companyId, type, data, eventId);
  });
}

async function dispatchNow(
  companyId: string,
  type: WebhookEventType,
  data: Record<string, unknown>,
  eventId?: string,
) {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: endpoints } = await admin
    .from("webhook_endpoints")
    .select("id, events")
    .eq("company_id", companyId)
    .eq("active", true);

  const matched = (endpoints ?? []).filter((ep) =>
    ((ep.events as string[]) ?? []).includes(type),
  );
  if (matched.length === 0) return;

  const id =
    eventId ??
    `evt_${type.replace(".", "_")}_${crypto.randomUUID().replace(/-/g, "")}`;
  const envelope: WebhookEnvelope = {
    id,
    type,
    created_at: new Date().toISOString(),
    data,
  };

  for (const ep of matched) {
    const { data: inserted, error } = await admin
      .from("webhook_deliveries")
      .insert({
        endpoint_id: ep.id,
        company_id: companyId,
        event_type: type,
        event_id: id,
        payload: envelope,
        status: "pending",
        next_attempt_at: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();

    if (error) {
      // Unique violation = already delivered / queued for this event
      if (!/duplicate|unique/i.test(error.message)) {
        console.error("[webhooks] insert", error.message);
      }
      continue;
    }
    if (!inserted?.id) continue;

    const deliveryId = inserted.id as number;
    await attemptDelivery(deliveryId);
    for (const delay of [2000, 4000]) {
      const { data: cur } = await admin
        .from("webhook_deliveries")
        .select("status")
        .eq("id", deliveryId)
        .maybeSingle();
      if (cur?.status === "success" || cur?.status === "failed") break;
      await sleep(delay);
      await attemptDelivery(deliveryId);
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
