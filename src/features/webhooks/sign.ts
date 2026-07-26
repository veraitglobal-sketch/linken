import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/** Generate a signing secret shown once (`whsec_…`). */
export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(24).toString("base64url")}`;
}

/** HMAC-SHA256 of `${timestamp}.${body}` — Stripe-style header. */
export function signWebhookPayload(
  secret: string,
  body: string,
  timestampSec: number,
): string {
  const base = `${timestampSec}.${body}`;
  const digest = createHmac("sha256", secret).update(base).digest("hex");
  return `t=${timestampSec},v1=${digest}`;
}

/** Verify Hansala-Signature (for docs / tests). */
export function verifyWebhookSignature(
  secret: string,
  body: string,
  header: string,
  toleranceSec = 300,
): boolean {
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, ...rest] = p.trim().split("=");
      return [k, rest.join("=")];
    }),
  );
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(t) || !v1) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - t) > toleranceSec) return false;
  const expected = signWebhookPayload(secret, body, t);
  const a = Buffer.from(expected);
  const b = Buffer.from(`t=${t},v1=${v1}`);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
