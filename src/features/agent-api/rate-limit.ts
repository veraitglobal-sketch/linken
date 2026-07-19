/**
 * In-memory sliding-window rate limits (per server instance).
 * v1 limitation: multi-instance deployments do not share counters —
 * treat as soft protection alongside invite daily audit checks.
 */

type Window = { timestamps: number[] };

const perMinute = new Map<string, Window>();
const inviteDay = new Map<string, { day: string; count: number }>();

const MINUTE_MS = 60_000;

export const AGENT_RATE_LIMIT_PER_MINUTE = 120;
export const AGENT_INVITE_LIMIT_PER_DAY = 20;

function prune(window: Window, now: number) {
  window.timestamps = window.timestamps.filter((t) => now - t < MINUTE_MS);
}

/** Returns retry-after seconds when limited, else null. */
export function checkAgentRateLimit(keyId: string): number | null {
  const now = Date.now();
  let window = perMinute.get(keyId);
  if (!window) {
    window = { timestamps: [] };
    perMinute.set(keyId, window);
  }
  prune(window, now);
  if (window.timestamps.length >= AGENT_RATE_LIMIT_PER_MINUTE) {
    const oldest = window.timestamps[0] ?? now;
    return Math.max(1, Math.ceil((oldest + MINUTE_MS - now) / 1000));
  }
  window.timestamps.push(now);
  return null;
}

/** Returns false when the key has already hit the daily invite cap. */
export function canSendInvite(keyId: string): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const entry = inviteDay.get(keyId);
  if (!entry || entry.day !== day) return true;
  return entry.count < AGENT_INVITE_LIMIT_PER_DAY;
}

/** Call only after a successful invite send. */
export function recordInviteSent(keyId: string): void {
  const day = new Date().toISOString().slice(0, 10);
  const entry = inviteDay.get(keyId);
  if (!entry || entry.day !== day) {
    inviteDay.set(keyId, { day, count: 1 });
    return;
  }
  entry.count += 1;
}
