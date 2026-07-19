import { createClient } from "@/lib/supabase/server";

export type ClaimPreview = {
  companyId: string;
  companyName: string;
  companySlug: string;
  companyCategory: string;
  companyCity: string;
  inviteEmail: string | null;
  claimed: boolean;
  inviterId: string | null;
  inviterName: string | null;
  inviterSlug: string | null;
  pendingPartnerships: number;
};

export async function getClaimPreview(token: string): Promise<ClaimPreview | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_claim_preview", {
      p_token: token,
    });

    if (error || !data?.[0]) return null;
    const row = data[0];

    return {
      companyId: row.company_id,
      companyName: row.company_name,
      companySlug: row.company_slug,
      companyCategory: row.company_category,
      companyCity: row.company_city,
      inviteEmail: row.invite_email,
      claimed: row.claimed,
      inviterId: row.inviter_id,
      inviterName: row.inviter_name,
      inviterSlug: row.inviter_slug,
      pendingPartnerships: Number(row.pending_partnerships ?? 0),
    };
  } catch {
    return null;
  }
}

export async function viewerOwnsClaimedCompany() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, company: null };

    const { data: company } = await supabase
      .from("companies")
      .select("id, name, slug")
      .eq("owner_id", user.id)
      .eq("claimed", true)
      .maybeSingle();

    return { user, company };
  } catch {
    return { user: null, company: null };
  }
}
