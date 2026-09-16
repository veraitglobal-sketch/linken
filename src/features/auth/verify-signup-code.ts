"use server";

import { redirect } from "next/navigation";
import { consumeSignupCode } from "@/features/auth/signup-code";
import { createClient } from "@/lib/supabase/server";

function digits(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 4);
}

function failUrl(from: string, email: string, next: string, message: string) {
  const q = new URLSearchParams({ error: message, email });
  if (from === "check-email") {
    return `/onboarding/check-email?${q.toString()}`;
  }
  q.set("verify", "1");
  q.set("next", next);
  return `/login?${q.toString()}`;
}

export async function verifySignupCode(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = digits(String(formData.get("code") ?? ""));
  const next = String(formData.get("next") ?? "/onboarding");
  const from = String(formData.get("from") ?? "login");
  const bounce = (message: string): never => {
    redirect(failUrl(from, email, next, message));
  };

  if (!email.includes("@") || code.length !== 4) {
    return bounce("Enter the 4-digit code from the email.");
  }

  const consumed = await consumeSignupCode(email, code);
  if (!consumed.ok) return bounce(consumed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: consumed.type,
    token_hash: consumed.tokenHash,
  });
  if (error) {
    console.error("[signup-code] verifyOtp", error.message);
    return bounce("That code is no longer valid. Send a new one.");
  }
  redirect(consumed.next);
}
