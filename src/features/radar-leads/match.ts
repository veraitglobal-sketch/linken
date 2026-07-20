import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RadarFeedReason } from "@/types/radar-leads";

/**
 * Fan-out a company event into Radar discovery feeds.
 * Requires SUPABASE_SERVICE_ROLE_KEY (RPC is service_role only).
 *
 * TODO(cron): call with reason `level_up` when trust level rises.
 */
export async function matchCompanyToSearches(
  companyId: string,
  reason: RadarFeedReason,
): Promise<number> {
  if (!companyId) return 0;

  if (reason === "level_up") {
    // Computed trust — no stored level change event yet.
    console.info("[radar-leads] level_up matching TODO/cron — skipped", companyId);
    return 0;
  }

  const admin = createAdminClient();
  if (!admin) {
    console.warn(
      "[radar-leads] match skipped — SUPABASE_SERVICE_ROLE_KEY not configured",
    );
    return 0;
  }

  const { data, error } = await admin.rpc("match_company_to_searches", {
    p_company_id: companyId,
    p_reason: reason,
  });

  if (error) {
    console.error("[radar-leads] match_company_to_searches:", error.message);
    return 0;
  }

  return typeof data === "number" ? data : 0;
}
