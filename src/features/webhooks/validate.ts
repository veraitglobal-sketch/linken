import {
  WEBHOOK_EVENTS,
  type WebhookEventType,
} from "@/features/webhooks/types";

const MAX_URL = 2048;

/** Validate HTTPS webhook URL (localhost HTTP allowed for local tests). */
export function normalizeWebhookUrl(
  raw: unknown,
): { ok: true; url: string } | { ok: false; error: string } {
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false, error: "url is required." };
  }
  const trimmed = raw.trim();
  if (trimmed.length > MAX_URL) {
    return { ok: false, error: "url is too long." };
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: "url must be a valid absolute URL." };
  }
  const host = parsed.hostname.toLowerCase();
  const local =
    host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  if (parsed.protocol === "http:") {
    if (!local) {
      return { ok: false, error: "url must use https:// (except localhost)." };
    }
  } else if (parsed.protocol !== "https:") {
    return { ok: false, error: "url must use https://" };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, error: "url must not include credentials." };
  }
  return { ok: true, url: parsed.toString() };
}

export function normalizeWebhookEvents(
  raw: unknown,
): { ok: true; events: WebhookEventType[] } | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "events must be a non-empty array." };
  }
  const events: WebhookEventType[] = [];
  for (const item of raw) {
    if (typeof item !== "string" || !(WEBHOOK_EVENTS as readonly string[]).includes(item)) {
      return {
        ok: false,
        error: `Invalid event. Allowed: ${WEBHOOK_EVENTS.join(", ")}`,
      };
    }
    if (!events.includes(item as WebhookEventType)) {
      events.push(item as WebhookEventType);
    }
  }
  return { ok: true, events };
}
