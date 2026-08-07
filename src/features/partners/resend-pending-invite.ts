"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  REMINDER_COOLDOWN_HOURS,
  reminderCooldownActive,
  reminderCooldownMessage,
} from "@/features/growth/invite-limits";
import { assertInviteEmailDailyQuota } from "@/features/growth/invite-quota";
import { sendClaimInviteEmail } from "@/lib/email";
import { trackEngagement } from "@/features/product-analytics/helpers";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Resend claim invite — respects outreach opt-out, cooldown, and daily caps.
 */
export async function resendPendingPartnerInvite(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "").trim();
  const back = String(formData.get("back") ?? "/dashboard/partners").trim();
  const safeBack = back.startsWith("/") ? back : "/dashboard/partners";

  const { user, company, supabase } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(safeBack)}`);
  if (!company) {
    redirect(
      `${safeBack}?error=${encodeURIComponent("Create your company profile first.")}`,
    );
  }

  const { data: prefs } = await supabase
    .from("companies")
    .select("invite_reminders_enabled")
    .eq("id", company.id)
    .maybeSingle();

  if (prefs && prefs.invite_reminders_enabled === false) {
    redirect(
      `${safeBack}?error=${encodeURIComponent("Invite reminders are turned off in outreach settings.")}`,
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect(
      `${safeBack}?error=${encodeURIComponent("Resend needs SUPABASE_SERVICE_ROLE_KEY.")}`,
    );
  }

  const emailQuota = await assertInviteEmailDailyQuota(admin, company.id);
  if (!emailQuota.ok) {
    redirect(`${safeBack}?error=${encodeURIComponent(emailQuota.error)}`);
  }

  const { data: partnership } = await admin
    .from("partnerships")
    .select("id, created_at, updated_at")
    .eq("requester_id", company.id)
    .eq("recipient_id", companyId)
    .eq("status", "pending")
    .maybeSingle();

  if (!partnership) {
    redirect(
      `${safeBack}?error=${encodeURIComponent("Pending invite not found.")}`,
    );
  }

  const lastTouch = (partnership.updated_at as string | null) ??
    (partnership.created_at as string | null);
  if (reminderCooldownActive(lastTouch)) {
    redirect(
      `${safeBack}?error=${encodeURIComponent(reminderCooldownMessage(REMINDER_COOLDOWN_HOURS))}`,
    );
  }

  const { data: ghost } = await admin
    .from("companies")
    .select("id, name, invite_email, claim_token, claimed, created_by_company_id")
    .eq("id", companyId)
    .maybeSingle();

  if (
    !ghost ||
    ghost.claimed !== false ||
    !ghost.claim_token ||
    ghost.created_by_company_id !== company.id
  ) {
    redirect(
      `${safeBack}?error=${encodeURIComponent("Invite link is no longer available.")}`,
    );
  }
  if (!ghost.invite_email) {
    redirect(
      `${safeBack}?error=${encodeURIComponent("No invite email on this draft.")}`,
    );
  }

  const sent = await sendClaimInviteEmail({
    to: ghost.invite_email as string,
    inviterName: company.name,
    companyName: ghost.name as string,
    claimToken: ghost.claim_token as string,
  });
  if (!sent.ok) {
    redirect(
      `${safeBack}?error=${encodeURIComponent(sent.error ?? "Could not send invite email.")}`,
    );
  }

  await admin
    .from("partnerships")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", partnership.id);

  void trackEngagement("reminder_sent", company.id, {
    invite_kind: "partnership",
    surface: "email",
    source: "resend",
  });

  revalidatePath(safeBack);
  redirect(`${safeBack}?resent=1`);
}
