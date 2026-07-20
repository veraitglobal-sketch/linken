"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendClaimInviteEmail } from "@/lib/email";
import { requireOperatorActiveCompany } from "@/features/workspace/require-operator";

export async function resendOperatorClaimInvite(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "").trim();
  const back = "/dashboard";

  const { supabase, user, company } = await requireOperatorActiveCompany({
    loginNext: back,
  });
  if (!user || !company || company.id !== companyId) {
    redirect(`${back}?error=${encodeURIComponent("Not allowed.")}`);
  }

  const { data, error } = await supabase.rpc("operator_resend_claim_invite", {
    p_company_id: companyId,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row?.invite_email || !row?.claim_token) {
    redirect(
      `${back}?error=${encodeURIComponent(error?.message ?? "No invite email on file.")}`,
    );
  }

  await sendClaimInviteEmail({
    to: row.invite_email as string,
    inviterName: company.name,
    companyName: (row.company_name as string) || company.name,
    claimToken: row.claim_token as string,
  });

  revalidatePath(back);
  redirect(`${back}?claimResent=1`);
}
