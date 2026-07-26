import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

const MAX_AGE_MS = 15 * 60 * 1000;

function secret(): string {
  return (
    process.env.SCHEDULING_OAUTH_STATE_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "hansala-scheduling-dev"
  );
}

/** Signed state: companyId.userId.exp.sig */
export function signSchedulingState(input: {
  companyId: string;
  userId: string;
}): string {
  const exp = String(Date.now() + MAX_AGE_MS);
  const payload = `${input.companyId}.${input.userId}.${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySchedulingState(
  state: string,
): { companyId: string; userId: string } | null {
  const parts = state.split(".");
  if (parts.length !== 4) return null;
  const [companyId, userId, exp, sig] = parts;
  if (!companyId || !userId || !exp || !sig) return null;
  if (Date.now() > Number(exp)) return null;
  const payload = `${companyId}.${userId}.${exp}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return { companyId, userId };
}
