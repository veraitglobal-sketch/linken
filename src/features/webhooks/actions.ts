"use server";

import { revalidatePath } from "next/cache";
import {
  createWebhookEndpointCore,
  deleteWebhookEndpointCore,
  listWebhookEndpointsCore,
  updateWebhookEndpointCore,
} from "@/features/webhooks/endpoints";
import { emitWebhookEvent } from "@/features/webhooks/dispatch";
import type {
  WebhookDeliveryRow,
  WebhookEndpointPublic,
  WebhookEventType,
} from "@/features/webhooks/types";
import { WEBHOOK_EVENTS } from "@/features/webhooks/types";
import { getEntitlements, parsePlan } from "@/features/plan/entitlements";
import { getOwnedActiveCompany } from "@/features/workspace/require-owned";

async function requireProOwner() {
  const ctx = await getOwnedActiveCompany();
  if (!ctx.user || !ctx.company) {
    return { ok: false as const, error: "Sign in as a company owner." };
  }
  if (!getEntitlements(parsePlan(ctx.company.plan)).agentApi) {
    return {
      ok: false as const,
      error: "Webhooks require Pro. Upgrade on Billing first.",
    };
  }
  return { ok: true as const, ...ctx };
}

export async function listWebhookEndpoints(): Promise<WebhookEndpointPublic[]> {
  const gate = await requireProOwner();
  if (!gate.ok) return [];
  const result = await listWebhookEndpointsCore(gate.supabase, gate.company!.id);
  return result.ok ? result.data : [];
}

export async function listWebhookDeliveries(
  limit = 30,
): Promise<WebhookDeliveryRow[]> {
  const gate = await requireProOwner();
  if (!gate.ok) return [];

  const { data, error } = await gate.supabase
    .from("webhook_deliveries")
    .select(
      "id, endpoint_id, event_type, event_id, status, attempt_count, last_status_code, last_error, created_at, completed_at",
    )
    .eq("company_id", gate.company!.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[listWebhookDeliveries]", error.message);
    return [];
  }

  return (data ?? []).map((r) => ({
    id: r.id as number,
    endpoint_id: r.endpoint_id as string,
    event_type: r.event_type as string,
    event_id: r.event_id as string,
    status: r.status as WebhookDeliveryRow["status"],
    attempt_count: r.attempt_count as number,
    last_status_code: (r.last_status_code as number | null) ?? null,
    last_error: (r.last_error as string) ?? "",
    created_at: r.created_at as string,
    completed_at: (r.completed_at as string | null) ?? null,
  }));
}

export async function createWebhookEndpointAction(input: {
  url: string;
  description?: string;
  events: string[];
}): Promise<
  | { ok: true; endpoint: WebhookEndpointPublic }
  | { ok: false; error: string }
> {
  const gate = await requireProOwner();
  if (!gate.ok) return gate;

  const result = await createWebhookEndpointCore(gate.supabase, gate.company!.id, input);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/dashboard/api");
  return { ok: true, endpoint: result.data };
}

export async function updateWebhookEndpointAction(input: {
  id: string;
  url?: string;
  description?: string;
  events?: string[];
  active?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireProOwner();
  if (!gate.ok) return gate;

  const result = await updateWebhookEndpointCore(
    gate.supabase,
    gate.company!.id,
    input.id,
    input,
  );
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/dashboard/api");
  return { ok: true };
}

export async function deleteWebhookEndpointAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireProOwner();
  if (!gate.ok) return gate;

  const result = await deleteWebhookEndpointCore(
    gate.supabase,
    gate.company!.id,
    id,
  );
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/dashboard/api");
  return { ok: true };
}

export async function sendTestWebhookAction(
  endpointId: string,
  event: string = "inquiry.created",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireProOwner();
  if (!gate.ok) return gate;

  const type = (WEBHOOK_EVENTS as readonly string[]).includes(event)
    ? (event as WebhookEventType)
    : null;
  if (!type) return { ok: false, error: "Invalid event." };

  const { data: ep } = await gate.supabase
    .from("webhook_endpoints")
    .select("id, events, active")
    .eq("id", endpointId)
    .eq("company_id", gate.company!.id)
    .maybeSingle();

  if (!ep?.active) return { ok: false, error: "Endpoint not found or inactive." };
  if (!((ep.events as string[]) ?? []).includes(type)) {
    return { ok: false, error: "Endpoint is not subscribed to that event." };
  }

  emitWebhookEvent(gate.company!.id, type, {
    test: true,
    message: "Hansala webhook test event",
  });
  revalidatePath("/dashboard/api");
  return { ok: true };
}
