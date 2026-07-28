import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type AdminDisputeRow = {
  id: string;
  recordType: string;
  recordId: string;
  claim: string;
  status: string;
  claimantName: string;
  counterpartyName: string | null;
  openedAt: string;
};

export async function listOpenDisputes(limit = 100): Promise<AdminDisputeRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("trust_disputes")
    .select(
      "id, record_type, record_id, claim, status, opened_at, claimant:claimant_company_id(name), counterparty:counterparty_company_id(name)",
    )
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => ({
    id: r.id as string,
    recordType: r.record_type as string,
    recordId: r.record_id as string,
    claim: r.claim as string,
    status: r.status as string,
    claimantName: (r.claimant as { name?: string } | null)?.name ?? "—",
    counterpartyName: (r.counterparty as { name?: string } | null)?.name ?? null,
    openedAt: r.opened_at as string,
  }));
}
