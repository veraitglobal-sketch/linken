import "server-only";

import { isExistingAccountError } from "@/features/company/signup-error";
import { newSignupCode, saveSignupCode } from "@/features/auth/signup-code";
import { sendSignupConfirmEmail } from "@/lib/email/signup-confirm";
import { createAdminClient } from "@/lib/supabase/admin";

export type SignupConfirmResult =
  | { ok: true }
  | { ok: false; existing: true }
  | { ok: false; error: string };

const MAIL_FAIL = "We could not send the confirmation email. Try again in a minute.";

type AuthUserRow = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
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

async function mailCode(
  email: string,
  tokenHash: string,
  otpType: "signup" | "magiclink",
  next: string,
) {
  const code = newSignupCode();
  const saved = await saveSignupCode({
    email,
    code,
    tokenHash,
    otpType,
    next,
  });
  if (!saved) return { ok: false as const, error: MAIL_FAIL };
  const sent = await sendSignupConfirmEmail(email, code);
  if (!sent.ok) {
    console.error("[signup-confirm]", sent.error);
    return { ok: false as const, error: MAIL_FAIL };
  }
  return { ok: true as const };
}

export async function registerAndSendConfirm(input: {
  email: string;
  password: string;
  next: string;
}): Promise<SignupConfirmResult> {
  const email = input.email.trim().toLowerCase();
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Could not create the account. Try again." };

  const created = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password: input.password,
  });
  const token = created.data.properties?.hashed_token;
  if (!created.error && token) return mailCode(email, token, "signup", input.next);

  const msg = created.error?.message ?? "";
  if (!isExistingAccountError(msg)) {
    console.error("[signup-confirm] generateLink", created.error?.code, msg);
    return { ok: false, error: msg || "Could not create the account. Try again." };
  }

  const existing = await findAuthUser(email);
  if (!existing || existing.email_confirmed_at) return { ok: false, existing: true };

  const { error: pwdError } = await admin.auth.admin.updateUserById(existing.id, {
    password: input.password,
  });
  if (pwdError) console.error("[signup-confirm] password update", pwdError.message);
  return resendSignupConfirm(email, input.next);
}

export async function resendSignupConfirm(
  rawEmail: string,
  next: string,
): Promise<SignupConfirmResult> {
  const email = rawEmail.trim().toLowerCase();
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: MAIL_FAIL };

  const existing = await findAuthUser(email);
  if (!existing) return { ok: false, error: MAIL_FAIL };
  if (existing.email_confirmed_at) return { ok: false, existing: true };

  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const token = link.data.properties?.hashed_token;
  if (link.error || !token) {
    console.error("[signup-confirm] resend", link.error?.message);
    return { ok: false, error: MAIL_FAIL };
  }
  return mailCode(email, token, "magiclink", next);
}
