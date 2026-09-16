import "server-only";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_ATTEMPTS = 5;
const TTL_MS = 15 * 60 * 1000;

export function newSignupCode() {
  return String(randomInt(0, 10_000)).padStart(4, "0");
}

export function hashSignupCode(email: string, code: string, pepper: string) {
  return createHash("sha256")
    .update(`${pepper}:${email}:${code}`)
    .digest("hex");
}

function pepper() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dev";
}

function hashesMatch(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function saveSignupCode(input: {
  email: string;
  code: string;
  tokenHash: string;
  otpType: "signup" | "magiclink" | "recovery";
  next: string;
}) {
  const admin = createAdminClient();
  if (!admin) return false;
  const { error } = await admin.from("signup_email_codes").upsert({
    email: input.email,
    code_hash: hashSignupCode(input.email, input.code, pepper()),
    token_hash: input.tokenHash,
    otp_type: input.otpType,
    next_path: input.next,
    attempts: 0,
    expires_at: new Date(Date.now() + TTL_MS).toISOString(),
  });
  if (error) {
    console.error("[signup-code] save", error.message);
    return false;
  }
  return true;
}

export async function consumeSignupCode(
  email: string,
  code: string,
): Promise<
  | { ok: true; tokenHash: string; type: EmailOtpType; next: string }
  | { ok: false; error: string }
> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Could not confirm the code. Try again." };

  const { data: row } = await admin
    .from("signup_email_codes")
    .select("code_hash, token_hash, otp_type, next_path, attempts, expires_at")
    .eq("email", email)
    .maybeSingle();

  if (!row) return { ok: false, error: "Enter the 4-digit code from the email." };
  if (new Date(row.expires_at as string).getTime() < Date.now()) {
    return { ok: false, error: "That code has expired. Send a new one." };
  }
  if ((row.attempts as number) >= MAX_ATTEMPTS) {
    return { ok: false, error: "Too many attempts. Send a new code." };
  }

  const expected = hashSignupCode(email, code, pepper());
  if (!hashesMatch(expected, row.code_hash as string)) {
    await admin
      .from("signup_email_codes")
      .update({ attempts: (row.attempts as number) + 1 })
      .eq("email", email);
    return { ok: false, error: "That code is not correct." };
  }

  await admin.from("signup_email_codes").delete().eq("email", email);
  const next = String(row.next_path ?? "/onboarding");
  return {
    ok: true,
    tokenHash: row.token_hash as string,
    type: row.otp_type as EmailOtpType,
    next: next.startsWith("/") && !next.startsWith("//") ? next : "/onboarding",
  };
}
