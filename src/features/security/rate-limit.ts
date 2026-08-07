/**
 * Simple sliding-window rate limit (per server instance).
 * Prefer durable limits for high-value abuse paths when available.
 */

type Bucket = { resetAt: number; count: number };

const buckets = new Map<string, Bucket>();

export function takeRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  let bucket = buckets.get(input.key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { resetAt: now + input.windowMs, count: 0 };
    buckets.set(input.key, bucket);
  }
  if (bucket.count >= input.limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { ok: true };
}

/** Best-effort client IP from proxy headers (never trust alone for auth). */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return "unknown";
}
