import type { SupabaseClient } from "@supabase/supabase-js";

/** Max unclaimed (ghost) profiles one firm may create per UTC day. */
export const GHOST_DAILY_LIMIT = 10;

/**
 * Count unclaimed companies created today by this firm.
 * Returns an error message when the daily cap is reached.
 */
export async function assertGhostDailyQuota(
  supabase: SupabaseClient,
  createdByCompanyId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!createdByCompanyId) {
    return { ok: false, error: "Missing company." };
  }

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("companies")
    .select("id", { count: "exact", head: true })
    .eq("created_by_company_id", createdByCompanyId)
    .eq("claimed", false)
    .gte("created_at", startOfDay.toISOString());

  if (error) {
    console.error("[assertGhostDailyQuota]", error.message);
    return { ok: false, error: "Could not check draft profile limit." };
  }

  if ((count ?? 0) >= GHOST_DAILY_LIMIT) {
    return {
      ok: false,
      error: `Daily limit of ${GHOST_DAILY_LIMIT} unclaimed profiles reached. Try again tomorrow.`,
    };
  }

  return { ok: true };
}
