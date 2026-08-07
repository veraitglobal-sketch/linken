import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  INVITE_EMAIL_DAILY_LIMIT,
  inviteLimitMessage,
  inviteLimitReached,
} from "@/features/growth/invite-limits";

/** Count invite emails attributed to a company today (UTC). */
export async function countInviteEmailsToday(
  supabase: SupabaseClient,
  companyId: string,
): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("product_events")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("event_name", "invitation_sent")
    .gte("created_at", startOfDay.toISOString());

  if (error) {
    console.error("[countInviteEmailsToday]", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function assertInviteEmailDailyQuota(
  supabase: SupabaseClient,
  companyId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sent = await countInviteEmailsToday(supabase, companyId);
  if (inviteLimitReached(sent, INVITE_EMAIL_DAILY_LIMIT)) {
    return { ok: false, error: inviteLimitMessage() };
  }
  return { ok: true };
}
