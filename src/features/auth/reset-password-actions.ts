"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendPasswordReset } from "@/features/auth/send-password-reset";
import { consumeSignupCode } from "@/features/auth/signup-code";
import { clientIpFromHeaders, takeRateLimit } from "@/features/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

function digits(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 4);
}

function bounce(path: string, params: Record<string, string>): never {
  const q = new URLSearchParams(params);
  redirect(`${path}?${q.toString()}`);
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) {
    bounce("/login/forgot", { error: "Enter a valid email." });
  }
  const ip = clientIpFromHeaders(await headers());
  const limited =
    takeRateLimit({ key: `pwreset:ip:${ip}`, limit: 8, windowMs: 15 * 60 * 1000 }).ok === false ||
    takeRateLimit({ key: `pwreset:em:${email}`, limit: 5, windowMs: 15 * 60 * 1000 }).ok === false;
  if (!limited) await sendPasswordReset(email);
  bounce("/login/forgot", { email, sent: "1" });
}

export async function resendPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) bounce("/login/forgot", { error: "Enter a valid email." });
  const ip = clientIpFromHeaders(await headers());
  const limited =
    takeRateLimit({ key: `pwreset:ip:${ip}`, limit: 8, windowMs: 15 * 60 * 1000 }).ok === false ||
    takeRateLimit({ key: `pwreset:em:${email}`, limit: 5, windowMs: 15 * 60 * 1000 }).ok === false;
  if (!limited) await sendPasswordReset(email);
  bounce("/login/forgot", { email, sent: "1", resent: "1" });
}

export async function verifyPasswordResetCode(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = digits(String(formData.get("code") ?? ""));
  const fail = (message: string): never => bounce("/login/forgot", { email, sent: "1", error: message });
  if (!email.includes("@") || code.length !== 4) {
    return fail("Enter the 4-digit code from the email.");
  }
  const consumed = await consumeSignupCode(email, code);
  if (!consumed.ok) return fail(consumed.error);
  if (consumed.type !== "recovery") {
    return fail("Enter the 4-digit code from the email.");
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: "recovery",
    token_hash: consumed.tokenHash,
  });
  if (error) {
    console.error("[password-reset] verifyOtp", error.message);
    return fail("That code is no longer valid. Send a new one.");
  }
  redirect("/login/update-password");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 6) {
    bounce("/login/update-password", {
      error: "Enter a password of at least 6 characters.",
    });
  }
  if (password !== confirm) {
    bounce("/login/update-password", { error: "Those passwords do not match." });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login/forgot");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    bounce("/login/update-password", {
      error: "Could not save the new password. Try again.",
    });
  }
  redirect("/dashboard");
}
