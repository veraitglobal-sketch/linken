"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VERIFY_EMAIL_COOKIE } from "@/features/auth/verify-email-cookie";
import {
  registerAndSendConfirm,
  resendSignupConfirm,
} from "@/features/auth/send-signup-confirm";
import {
  isExistingAccountError,
  signupErrorMessage,
} from "@/features/company/signup-error";
import { getAuthSiteUrl } from "@/lib/site";

function safeNext(value: FormDataEntryValue | null, fallback: string) {
  const next = String(value ?? fallback).trim();
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

function loginError(message: string, next?: string): never {
  const q = new URLSearchParams({ error: message });
  if (next) q.set("next", next);
  redirect(`/login?${q.toString()}`);
}

function authCallbackUrl(next: string) {
  return `${getAuthSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

async function stashVerifyEmail(email: string) {
  const jar = await cookies();
  jar.set(VERIFY_EMAIL_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"), "/onboarding");
  const registered = await registerAndSendConfirm({ email, password, next });
  if (!registered.ok) {
    if ("existing" in registered && registered.existing) {
      loginError("That email already has an account. Sign in to finish.", next);
    }
    const message =
      "error" in registered ? registered.error : "Could not create the account. Try again.";
    if (isExistingAccountError(message)) {
      loginError("That email already has an account. Sign in to finish.", next);
    }
    loginError(message, next);
  }

  const { logActivationEvent } = await import("@/features/activation/events");
  void logActivationEvent(null, "signup_completed");
  await stashVerifyEmail(email);
  redirect(`/login?verify=1&next=${encodeURIComponent(next)}`);
}

/** OAuth providers we allow — Supabase ids ("azure" is Microsoft). */
const OAUTH_PROVIDERS = ["google", "azure"] as const;
type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

/**
 * Google / Microsoft sign-in. Only reachable when the provider is switched on
 * (see `enabledOAuthProviders`), so a visitor never meets a dead button.
 * Lands on the existing /auth/callback, which exchanges the code.
 */
export async function signInWithProvider(formData: FormData) {
  const raw = String(formData.get("provider") ?? "");
  const next = safeNext(formData.get("next"), "/dashboard");
  if (!(OAUTH_PROVIDERS as readonly string[]).includes(raw)) {
    loginError("Unknown sign-in method", next);
  }
  const provider = raw as OAuthProvider;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: authCallbackUrl(next),
      ...(provider === "azure" ? { scopes: "email" } : {}),
    },
  });
  if (error || !data.url) {
    loginError(error ? signupErrorMessage(error) : "Could not start sign in", next);
  }
  redirect(data.url);
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"), "/dashboard");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const text = String(error.message ?? "").trim();
    loginError(
      !text || text === "{}" || text === "[object Object]"
        ? "Could not sign in. Check your email and password."
        : text,
      next,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) loginError("Could not sign in. Check your email and password.", next);

  const { isPlatformStaffUser, resolvePostLoginPath } = await import(
    "@/features/admin/is-platform-staff"
  );
  const staff = await isPlatformStaffUser(user.id, user.email);
  redirect(resolvePostLoginPath(staff, next));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signOutTo(formData: FormData) {
  const next = safeNext(formData.get("next"), "/");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(next);
}

export async function resendSignupConfirmation(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const next = safeNext(formData.get("next"), "/onboarding");
  const from = String(formData.get("from") ?? "login");
  const back =
    from === "check-email"
      ? `/onboarding/check-email?email=${encodeURIComponent(email)}`
      : `/login?verify=1&next=${encodeURIComponent(next)}`;
  if (!email) redirect("/login?error=Email%20is%20required");

  const sent = await resendSignupConfirm(email, next);
  if (!sent.ok) {
    const message =
      "existing" in sent && sent.existing
        ? "That email already has an account. Sign in to finish."
        : "error" in sent
          ? sent.error
          : "We could not send the confirmation email. Try again in a minute.";
    const join = back.includes("?") ? "&" : "?";
    redirect(`${back}${join}error=${encodeURIComponent(message)}`);
  }
  await stashVerifyEmail(email);
  const join = back.includes("?") ? "&" : "?";
  redirect(`${back}${join}resent=1`);
}
