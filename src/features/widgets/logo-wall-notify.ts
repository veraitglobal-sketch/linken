import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendLogoWallOverrideEmail } from "@/lib/email/logo-wall";

/** Resolve a contact email for the partner company (invite or owner). */
export async function resolvePartnerNotifyEmail(
  admin: SupabaseClient,
  partnerCompanyId: string,
): Promise<string | null> {
  const { data: company } = await admin
    .from("companies")
    .select("invite_email, owner_id")
    .eq("id", partnerCompanyId)
    .maybeSingle();
  if (!company) return null;
  if (typeof company.invite_email === "string" && company.invite_email.trim()) {
    return company.invite_email.trim().toLowerCase();
  }
  if (company.owner_id) {
    const { data: ownerData } = await admin.auth.admin.getUserById(
      company.owner_id as string,
    );
    return ownerData.user?.email?.toLowerCase() ?? null;
  }
  return null;
}

export async function notifyPartnerOfLogoOverride(input: {
  admin: SupabaseClient;
  partnerCompanyId: string;
  partnerName: string;
  ownerName: string;
  ownerSlug: string;
  logoUrl: string;
  rejectToken: string;
}): Promise<{ sent: boolean; error?: string }> {
  const to = await resolvePartnerNotifyEmail(
    input.admin,
    input.partnerCompanyId,
  );
  if (!to) return { sent: false };
  const sent = await sendLogoWallOverrideEmail({
    to,
    partnerName: input.partnerName,
    ownerName: input.ownerName,
    ownerSlug: input.ownerSlug,
    logoUrl: input.logoUrl,
    rejectToken: input.rejectToken,
  });
  if (!sent.ok) return { sent: false, error: sent.error };
  return { sent: true };
}
