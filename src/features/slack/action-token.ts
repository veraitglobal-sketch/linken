import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  return (
    process.env.SLACK_ACTION_SECRET?.trim() ||
    process.env.SLACK_SIGNING_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "hansala-slack-action-dev"
  );
}

export type SlackPartnershipAction = {
  partnershipId: string;
  companyId: string;
  decision: "accepted" | "declined";
};

/** value for Block Kit buttons — partnershipId.companyId.decision.exp.sig */
export function signSlackPartnershipAction(
  input: SlackPartnershipAction,
): string {
  const exp = String(Date.now() + MAX_AGE_MS);
  const payload = `${input.partnershipId}.${input.companyId}.${input.decision}.${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySlackPartnershipAction(
  value: string,
): SlackPartnershipAction | null {
  const parts = value.split(".");
  if (parts.length !== 5) return null;
  const [partnershipId, companyId, decision, exp, sig] = parts;
  if (!partnershipId || !companyId || !exp || !sig) return null;
  if (decision !== "accepted" && decision !== "declined") return null;
  if (Date.now() > Number(exp)) return null;
  const payload = `${partnershipId}.${companyId}.${decision}.${exp}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return { partnershipId, companyId, decision };
}
