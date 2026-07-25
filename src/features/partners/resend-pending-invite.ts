"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendClaimInviteEmail } from "@/lib/email";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Resend claim invite for a ghost partner the active company invited.
 * Active workspace must be the creator firm (not the draft itself).
 */
export async function resendPendingPartnerInvite(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "").trim();
  const back = String(formData.get("back") ?? "/dashboard/partners").trim();
  const safeBack = back.startsWith("/") ? back : "/dashboard/partners";

  const { user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(safeBack)}`);
  if (!company) {
    redirect(
      `${safeBack}?error=${encodeURIComponent("Create your company profile first.")}`,
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect(
      `${safeBack}?error=${encodeURIComponent("Resend needs SUPABASE_SERVICE_ROLE_KEY.")}`,
    );
  }

  const { data: partnership } = await admin
    .from("partnerships")
    .select("id")
    .eq("requester_id", company.id)
    .eq("recipient_id", companyId)
    .eq("status", "pending")
    .maybeSingle();

  if (!partnership) {
    redirect(
      `${safeBack}?error=${encodeURIComponent("Pending invite not found.")}`,
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

  revalidatePath(safeBack);
  redirect(`${safeBack}?resent=1`);
}
