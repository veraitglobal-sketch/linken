import "server-only";

import {
  MAX_DELIVERY_ATTEMPTS,
  type WebhookEnvelope,
} from "@/features/webhooks/types";
import {
  formatSlackWebhookBody,
  isSlackIncomingWebhookUrl,
} from "@/features/webhooks/slack-format";
import { sendWebhookPost } from "@/features/webhooks/send";
import { signWebhookPayload } from "@/features/webhooks/sign";
import { createAdminClient } from "@/lib/supabase/admin";

type EndpointRow = { id: string; url: string; secret: string };

/** Deliver one queued row. Retries up to MAX_DELIVERY_ATTEMPTS. */
export async function attemptDelivery(deliveryId: number): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: row } = await admin
    .from("webhook_deliveries")
    .select(
      "id, endpoint_id, company_id, event_type, event_id, payload, status, attempt_count",
    )
    .eq("id", deliveryId)
    .maybeSingle();

  if (!row || row.status === "success") return;
  if ((row.attempt_count as number) >= MAX_DELIVERY_ATTEMPTS) {
    await admin
      .from("webhook_deliveries")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        last_error: "Max attempts reached",
      })
      .eq("id", deliveryId);
    return;
  }

  const { data: endpoint } = await admin
    .from("webhook_endpoints")
    .select("id, url, secret, active")
    .eq("id", row.endpoint_id)
    .maybeSingle();

  if (!endpoint?.active) {
    await admin
      .from("webhook_deliveries")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        last_error: "Endpoint inactive",
      })
      .eq("id", deliveryId);
    return;
  }

  await postToEndpoint(admin, row.id as number, endpoint as EndpointRow, {
    id: row.event_id as string,
    type: row.event_type as WebhookEnvelope["type"],
    created_at: (row.payload as WebhookEnvelope).created_at,
    data: (row.payload as WebhookEnvelope).data,
  });
}

async function postToEndpoint(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  deliveryId: number,
  endpoint: EndpointRow,
  envelope: WebhookEnvelope,
) {
  const slack = isSlackIncomingWebhookUrl(endpoint.url);
  const body = slack
    ? formatSlackWebhookBody(envelope)
    : JSON.stringify(envelope);
  const ts = Math.floor(Date.now() / 1000);
  const signature = signWebhookPayload(endpoint.secret, body, ts);

  const { data: attemptRow } = await admin
    .from("webhook_deliveries")
    .select("attempt_count")
    .eq("id", deliveryId)
    .single();
  const nextCount = ((attemptRow?.attempt_count as number) ?? 0) + 1;

  const { statusCode, errMsg } = await sendWebhookPost(
    endpoint.url,
    body,
    slack
      ? undefined
      : {
          "Hansala-Signature": signature,
          "Hansala-Event": envelope.type,
          "Hansala-Delivery": String(deliveryId),
          "Hansala-Idempotency-Key": envelope.id,
        },
  );

  const ok = statusCode != null && statusCode >= 200 && statusCode < 300;
  const done = ok || nextCount >= MAX_DELIVERY_ATTEMPTS;

  await admin
    .from("webhook_deliveries")
    .update({
      attempt_count: nextCount,
      last_status_code: statusCode,
      last_error: errMsg.slice(0, 500),
      status: ok ? "success" : done ? "failed" : "pending",
      next_attempt_at:
        ok || done
          ? null
          : new Date(Date.now() + 2_000 * nextCount).toISOString(),
      completed_at: done ? new Date().toISOString() : null,
    })
    .eq("id", deliveryId);
}
