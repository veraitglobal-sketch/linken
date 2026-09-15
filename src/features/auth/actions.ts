"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VERIFY_EMAIL_COOKIE } from "@/features/auth/verify-email-cookie";
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
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"), "/onboarding");
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: authCallbackUrl(next) },
  });
  if (error) {
    loginError(error.message, next);
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
    loginError(error?.message ?? "Could not start sign in", next);
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
    loginError(error.message, next);
  }
  redirect(next);
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
  if (!email) redirect("/login?error=Email%20is%20required");

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: authCallbackUrl(next) },
  });
  if (error) {
    redirect(`/login?verify=1&error=${encodeURIComponent(error.message)}`);
  }
  await stashVerifyEmail(email);
  redirect(`/login?verify=1&resent=1&next=${encodeURIComponent(next)}`);
}
