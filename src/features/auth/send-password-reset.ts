import "server-only";

import { newSignupCode, saveSignupCode } from "@/features/auth/signup-code";
import { sendPasswordResetEmail } from "@/lib/email/password-reset";
import { createAdminClient } from "@/lib/supabase/admin";

type AuthUserRow = {
  id: string;
  email?: string | null;
};

async function findAuthUser(email: string): Promise<AuthUserRow | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const res = await fetch(
    `${url}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`,
    {
      headers: { Authorization: `Bearer ${key}`, apikey: key },
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  const body = (await res.json()) as { users?: AuthUserRow[] };
  const needle = email.toLowerCase();
  return (body.users ?? []).find((u) => (u.email ?? "").toLowerCase() === needle) ?? null;
}

/** Always succeeds to the caller — never disclose whether the address exists. */
export async function sendPasswordReset(email: string) {
  const existing = await findAuthUser(email);
  if (!existing) return;
  const admin = createAdminClient();
  if (!admin) return;
  const link = await admin.auth.admin.generateLink({ type: "recovery", email });
  const token = link.data.properties?.hashed_token;
  if (link.error || !token) {
    console.error("[password-reset] generateLink", link.error?.message);
    return;
  }
  const code = newSignupCode();
  const saved = await saveSignupCode({
    email,
    code,
    tokenHash: token,
    otpType: "recovery",
    next: "/login/update-password",
  });
  if (!saved) return;
  const sent = await sendPasswordResetEmail(email, code);
  if (!sent.ok) console.error("[password-reset]", sent.error);
}
