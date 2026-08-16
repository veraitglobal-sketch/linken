import "server-only";

import { cookies } from "next/headers";
import {
  REFERRAL_COOKIE,
  REFERRAL_COOKIE_MAX_AGE,
  sanitizeReferralSlug,
} from "@/features/growth/referral";

/**
 * First-touch only: set hansala_ref when ?ref= is present and cookie is empty.
 * Does not overwrite an existing referrer (first touch wins).
 */
export async function captureReferralFromRefParam(
  rawRef: string | null | undefined,
): Promise<void> {
  const slug = sanitizeReferralSlug(rawRef);
  if (!slug) return;
  try {
    const jar = await cookies();
    if (sanitizeReferralSlug(jar.get(REFERRAL_COOKIE)?.value)) return;
    jar.set(REFERRAL_COOKIE, slug, {
      path: "/",
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  } catch {
    // Best-effort; onboarding continues without attribution.
  }
}
