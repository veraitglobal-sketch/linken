import "server-only";

import { cookies } from "next/headers";
import {
  REFERRAL_COOKIE,
  sanitizeReferralSlug,
} from "@/features/growth/referral";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Soft attribution from public referrer slug cookie.
 * Never exposes invite emails; best-effort only.
 */
export async function applyReferralAttribution(
  createdCompanyId: string,
): Promise<void> {
  try {
    const jar = await cookies();
    const refSlug = sanitizeReferralSlug(jar.get(REFERRAL_COOKIE)?.value);
    if (!refSlug) return;

    const admin = createAdminClient();
    if (admin) {
      const { data: referrer } = await admin
        .from("companies")
        .select("id")
        .eq("slug", refSlug)
        .eq("claimed", true)
        .maybeSingle();
      if (referrer?.id && referrer.id !== createdCompanyId) {
        await admin
          .from("companies")
          .update({ referred_by_company_id: referrer.id })
          .eq("id", createdCompanyId);
      }
    }
    jar.delete(REFERRAL_COOKIE);
  } catch {
    // Referral attribution is best-effort.
  }
}
