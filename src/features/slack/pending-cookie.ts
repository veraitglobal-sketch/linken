import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import type { SlackOAuthResult } from "@/features/slack/oauth";

export const SLACK_PENDING_COOKIE = "hansala_slack_pending";
const MAX_AGE_SEC = 10 * 60;

function secret(): string {
  return (
    process.env.SLACK_ACTION_SECRET?.trim() ||
    process.env.SLACK_SIGNING_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "hansala-slack-pending-dev"
  );
}

/** Short-lived signed blob after Marketplace OAuth, before Hansala login. */
export function encodeSlackPending(result: SlackOAuthResult): string {
  const body = Buffer.from(JSON.stringify(result), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function decodeSlackPending(raw: string): SlackOAuthResult | null {
  const i = raw.lastIndexOf(".");
  if (i <= 0) return null;
  const body = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const json = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SlackOAuthResult;
    if (!json.botToken?.startsWith("xoxb-") || !json.teamId) return null;
    if (!json.webhookUrl?.startsWith("https://hooks.slack.com/")) return null;
    return json;
  } catch {
    return null;
  }
}

export function slackPendingCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}
