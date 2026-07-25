import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getEntitlements, parsePlan } from "@/features/plan/entitlements";

/**
 * Seats = active members + pending invites.
 * Free plan: max 1 (owner only) — any invite is blocked.
 */
export async function assertTeamSeatAvailable(
  client: SupabaseClient,
  companyId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: company } = await client
    .from("companies")
    .select("plan")
    .eq("id", companyId)
    .maybeSingle();

  const max = getEntitlements(parsePlan(company?.plan)).maxTeamMembers;

  const [membersRes, invitesRes] = await Promise.all([
    client
      .from("company_members")
      .select("user_id", { count: "exact", head: true })
      .eq("company_id", companyId),
    client
      .from("team_invitations")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("status", "pending"),
  ]);

  const used =
    (membersRes.count ?? 0) + (invitesRes.count ?? 0);

  if (used >= max) {
    if (max <= 1) {
      return {
        ok: false,
        error:
          "Team seats require Pro. Upgrade on Billing to invite teammates.",
      };
    }
    return {
      ok: false,
      error: `Team seat limit reached (${max}). Upgrade or remove a member.`,
    };
  }

  return { ok: true };
}
