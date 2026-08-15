import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

const MAX_AGE_MS = 15 * 60 * 1000;

function secret(): string {
  return (
    process.env.SLACK_ACTION_SECRET?.trim() ||
    process.env.SLACK_SIGNING_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "hansala-slack-install-dev"
  );
}

/** Marketplace / Direct Install — no Hansala session yet. */
export function signSlackInstallState(): string {
  const exp = String(Date.now() + MAX_AGE_MS);
  const payload = `install.${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySlackInstallState(state: string): boolean {
  const parts = state.split(".");
  if (parts.length !== 3 || parts[0] !== "install") return false;
  const [, exp, sig] = parts;
  if (!exp || !sig) return false;
  if (Date.now() > Number(exp)) return false;
  const payload = `install.${exp}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
