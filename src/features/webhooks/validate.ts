import {
  WEBHOOK_EVENTS,
  type WebhookEventType,
} from "@/features/webhooks/types";
import {
  isBlockedHostname,
  isPrivateOrSpecialIp,
} from "@/features/security/private-ip";
import net from "node:net";

const MAX_URL = 2048;

/** Validate HTTPS webhook URL — block private hosts and credentials. */
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
  if (parsed.protocol !== "https:") {
    return { ok: false, error: "url must use https://" };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, error: "url must not include credentials." };
  }
  if (isBlockedHostname(host)) {
    return { ok: false, error: "url host is not allowed." };
  }
  if (net.isIP(host) && isPrivateOrSpecialIp(host)) {
    return { ok: false, error: "url must not target a private address." };
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
    if (
      typeof item !== "string" ||
      !(WEBHOOK_EVENTS as readonly string[]).includes(item)
    ) {
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
