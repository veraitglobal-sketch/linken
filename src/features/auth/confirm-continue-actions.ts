"use server";

import { redirect } from "next/navigation";
import { registerAndSendConfirm } from "@/features/auth/send-signup-confirm";
import { createClient } from "@/lib/supabase/server";
import { getAuthSiteUrl } from "@/lib/site";

function safeNext(value: FormDataEntryValue | null, fallback: string) {
  const next = String(value ?? fallback).trim();
  return next.startsWith("/") ? next : fallback;
}

function authCallbackUrl(next: string) {
  return `${getAuthSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

function withQuery(path: string, params: Record<string, string>) {
  const url = new URL(path, "https://hansala.local");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return `${url.pathname}?${url.searchParams.toString()}`;
}

/** Passwordless confirm — email link back to the invite URL. */
export async function sendConfirmMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = safeNext(formData.get("next"), "/dashboard");
  if (!email.includes("@")) {
    redirect(withQuery(next, { error: "Enter a valid email." }));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: authCallbackUrl(next) },
  });

  if (error) {
    redirect(withQuery(next, { error: error.message }));
  }

  redirect(
    withQuery(next, {
      checkEmail: "1",
      email,
    }),
  );
}

/**
 * One field: sign in if the account exists, otherwise create it and return
 * to the invite URL (or show verify-email on the same invite page).
 */
export async function continueWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"), "/dashboard");

  if (!email.includes("@") || password.length < 6) {
    redirect(
      withQuery(next, {
        error: "Email and password (min 6 characters) are required.",
      }),
    );
  }

  const supabase = await createClient();
  const signedIn = await supabase.auth.signInWithPassword({ email, password });
  if (!signedIn.error) {
    redirect(next);
  }

  const created = await registerAndSendConfirm({ email, password, next });
  if (!created.ok) {
    if ("existing" in created && created.existing) {
      redirect(
        withQuery(next, {
          error:
            "That email already has an account. Use the correct password, or enter the code from your email.",
        }),
      );
    }
    redirect(
      withQuery(next, {
        error: "error" in created ? created.error : "Could not create the account. Try again.",
      }),
    );
  }

  redirect(withQuery(next, { checkEmail: "1", email }));
}
