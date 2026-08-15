import "server-only";

import { assertPublicHostname } from "@/features/security/assert-public-host";

const FETCH_MS = 8_000;

/** POST JSON to a webhook URL — no redirects, public host only. */
export async function sendWebhookPost(
  url: string,
  body: string,
  extraHeaders?: Record<string, string>,
): Promise<{ statusCode: number | null; errMsg: string }> {
  try {
    const target = new URL(url);
    await assertPublicHostname(target.hostname);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_MS);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Hansala-Webhooks/1.0",
        ...extraHeaders,
      },
      body,
      signal: controller.signal,
      redirect: "error",
    });
    clearTimeout(timer);
    return {
      statusCode: res.status,
      errMsg: res.ok ? "" : `HTTP ${res.status}`,
    };
  } catch (e) {
    return {
      statusCode: null,
      errMsg: e instanceof Error ? e.message : "Delivery failed",
    };
  }
}
