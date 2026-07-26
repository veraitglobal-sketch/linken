import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { generateWebhookSecret } from "@/features/webhooks/sign";
import {
  MAX_WEBHOOK_ENDPOINTS,
  type WebhookEndpointPublic,
  type WebhookEventType,
} from "@/features/webhooks/types";
import {
  normalizeWebhookEvents,
  normalizeWebhookUrl,
} from "@/features/webhooks/validate";

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

function mapEndpoint(row: Record<string, unknown>): WebhookEndpointPublic {
  return {
    id: row.id as string,
    url: row.url as string,
    description: (row.description as string) ?? "",
    events: (row.events as WebhookEventType[]) ?? [],
    active: Boolean(row.active),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function listWebhookEndpointsCore(
  db: SupabaseClient,
  companyId: string,
): Promise<CoreResult<WebhookEndpointPublic[]>> {
  const { data, error } = await db
    .from("webhook_endpoints")
    .select("id, url, description, events, active, created_at, updated_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []).map((r) => mapEndpoint(r)) };
}

export async function createWebhookEndpointCore(
  db: SupabaseClient,
  companyId: string,
  input: { url?: unknown; description?: unknown; events?: unknown },
): Promise<CoreResult<WebhookEndpointPublic>> {
  const url = normalizeWebhookUrl(input.url);
  if (!url.ok) return { ok: false, error: url.error, status: 422 };
  const events = normalizeWebhookEvents(input.events);
  if (!events.ok) return { ok: false, error: events.error, status: 422 };

  const { count } = await db
    .from("webhook_endpoints")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);

  if ((count ?? 0) >= MAX_WEBHOOK_ENDPOINTS) {
    return {
      ok: false,
      error: `Maximum ${MAX_WEBHOOK_ENDPOINTS} webhook endpoints.`,
      status: 422,
    };
  }

  const secret = generateWebhookSecret();
  const description =
    typeof input.description === "string" ? input.description.trim().slice(0, 120) : "";

  const { data, error } = await db
    .from("webhook_endpoints")
    .insert({
      company_id: companyId,
      url: url.url,
      description,
      secret,
      events: events.events,
      active: true,
    })
    .select("id, url, description, events, active, created_at, updated_at")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create endpoint." };
  }

  return { ok: true, data: { ...mapEndpoint(data), secret } };
}

export async function updateWebhookEndpointCore(
  db: SupabaseClient,
  companyId: string,
  endpointId: string,
  input: {
    url?: unknown;
    description?: unknown;
    events?: unknown;
    active?: unknown;
  },
): Promise<CoreResult<WebhookEndpointPublic>> {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.url !== undefined) {
    const url = normalizeWebhookUrl(input.url);
    if (!url.ok) return { ok: false, error: url.error, status: 422 };
    patch.url = url.url;
  }
  if (input.events !== undefined) {
    const events = normalizeWebhookEvents(input.events);
    if (!events.ok) return { ok: false, error: events.error, status: 422 };
    patch.events = events.events;
  }
  if (typeof input.description === "string") {
    patch.description = input.description.trim().slice(0, 120);
  }
  if (typeof input.active === "boolean") {
    patch.active = input.active;
  }

  const { data, error } = await db
    .from("webhook_endpoints")
    .update(patch)
    .eq("id", endpointId)
    .eq("company_id", companyId)
    .select("id, url, description, events, active, created_at, updated_at")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Endpoint not found.", status: 404 };
  return { ok: true, data: mapEndpoint(data) };
}

export async function deleteWebhookEndpointCore(
  db: SupabaseClient,
  companyId: string,
  endpointId: string,
): Promise<CoreResult<{ deleted: true }>> {
  const { data, error } = await db
    .from("webhook_endpoints")
    .delete()
    .eq("id", endpointId)
    .eq("company_id", companyId)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Endpoint not found.", status: 404 };
  return { ok: true, data: { deleted: true } };
}
