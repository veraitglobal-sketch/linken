import "server-only";
import { sendRadarWeeklyDigestEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RadarDigestSummary } from "@/types/radar-leads";

async function loadDigestAdmin(
  companyId: string,
): Promise<RadarDigestSummary | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin.rpc("get_radar_digest", {
    p_company_id: companyId,
  });
  if (error || !data) {
    console.error("[radar-digest] get_radar_digest:", error?.message);
    return null;
  }
  const row = data as Record<string, unknown>;
  return {
    companyId: String(row.company_id ?? companyId),
    companyLeads: Number(row.company_leads ?? 0),
    projectRequests: Number(row.project_requests ?? 0),
    windowDays: Number(row.window_days ?? 7),
  };
}

/**
 * Prepare + send weekly Radar digest for one company.
 *
 * TODO(cron): iterate radar firms weekly; persist last_sent and skip if < 7 days.
 * No send-log table yet — callers must enforce max 1 / week.
 */
export async function sendWeeklyRadarDigestForCompany(input: {
  companyId: string;
  companyName: string;
  ownerEmail: string;
}): Promise<{ ok: boolean; skipped?: boolean; reason?: string }> {
  const digest = await loadDigestAdmin(input.companyId);
  if (!digest) {
    return { ok: false, reason: "digest_unavailable" };
  }

  if (digest.companyLeads === 0 && digest.projectRequests === 0) {
    return { ok: true, skipped: true, reason: "empty" };
  }

  const result = await sendRadarWeeklyDigestEmail({
    to: input.ownerEmail,
    companyName: input.companyName,
    companyLeads: digest.companyLeads,
    projectRequests: digest.projectRequests,
  });

  return { ok: result.ok, reason: result.ok ? undefined : "email_failed" };
}

/** service_role path for future cron — loads owner email via admin. */
export async function sendWeeklyRadarDigestAdmin(
  companyId: string,
): Promise<{ ok: boolean; skipped?: boolean; reason?: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, reason: "service_role_missing" };
  }

  const { data: company } = await admin
    .from("companies")
    .select("id, name, owner_id, radar")
    .eq("id", companyId)
    .maybeSingle();

  if (!company?.radar) {
    return { ok: false, reason: "not_radar" };
  }

  const { data: user } = await admin.auth.admin.getUserById(
    company.owner_id as string,
  );
  const email = user.user?.email;
  if (!email) {
    return { ok: false, reason: "no_owner_email" };
  }

  return sendWeeklyRadarDigestForCompany({
    companyId,
    companyName: String(company.name ?? "Your company"),
    ownerEmail: email,
  });
}
