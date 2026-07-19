import { createClient } from "@/lib/supabase/server";

export type OwnershipTransferPreview = {
  companyId: string;
  companyName: string;
  companySlug: string;
  inviteEmail: string;
  status: string;
};

export type PendingOwnershipTransfer = {
  id: string;
  inviteEmail: string;
  createdAt: string;
};

export async function getOwnershipTransferPreview(
  token: string,
): Promise<OwnershipTransferPreview | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
      "get_ownership_transfer_preview",
      { p_token: token },
    );
    if (error || !data?.[0]) return null;
    const row = data[0];
    return {
      companyId: row.company_id,
      companyName: row.company_name,
      companySlug: row.company_slug,
      inviteEmail: row.invite_email,
      status: row.status,
    };
  } catch {
    return null;
  }
}

export async function getPendingOwnershipTransfer(
  companyId: string,
): Promise<PendingOwnershipTransfer | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("ownership_transfers")
      .select("id, invite_email, created_at")
      .eq("company_id", companyId)
      .eq("status", "pending")
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      inviteEmail: data.invite_email,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}
