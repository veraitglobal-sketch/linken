/**
 * Referral attribution — public slug only, never emails or tokens.
 * Used to credit growth loops without exposing private invite details.
 */

export const REFERRAL_COOKIE = "hansala_ref";
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function sanitizeReferralSlug(raw: string | null | undefined): string | null {
  const s = (raw ?? "").trim().toLowerCase();
  if (!s || s.length > 80) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) return null;
  return s;
}

export type InviteSource =
  | "dashboard"
  | "profile"
  | "agent"
  | "post_confirm"
  | "claim"
  | "resend"
  | "unknown";

export function parseInviteSource(raw: string | null | undefined): InviteSource {
  const v = (raw ?? "").trim().toLowerCase();
  if (
    v === "dashboard" ||
    v === "profile" ||
    v === "agent" ||
    v === "post_confirm" ||
    v === "claim" ||
    v === "resend"
  ) {
    return v;
  }
  return "unknown";
}
