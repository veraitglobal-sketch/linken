import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Drop partner links between two firms owned by the same account.
 * Self-owned drafts claimed under multi-company ownership used to auto-accept.
 */
export async function dissolveSameOwnerPartnerLinks(
  companyId: string,
  userId: string,
): Promise<number> {
  if (!companyId || !userId) return 0;

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("partnerships")
    .select("id, requester_id, recipient_id, status")
    .or(`requester_id.eq.${companyId},recipient_id.eq.${companyId}`)
    .in("status", ["pending", "accepted"]);

  if (!rows?.length) return 0;

  const otherIds = [
    ...new Set(
      rows.map((r) =>
        r.requester_id === companyId ? r.recipient_id : r.requester_id,
      ) as string[],
    ),
  ];

  const { data: others } = await supabase
    .from("companies")
    .select("id, owner_id")
    .in("id", otherIds);

  const mine = new Set(
    (others ?? [])
      .filter((o) => o.owner_id === userId)
      .map((o) => o.id as string),
  );
  if (!mine.size) return 0;

  let n = 0;
  for (const row of rows) {
    const otherId =
      row.requester_id === companyId ? row.recipient_id : row.requester_id;
    if (!mine.has(otherId as string)) continue;

    if (row.status === "accepted") {
      const { error } = await supabase.rpc("end_partnership", {
        p_partnership_id: row.id,
      });
      if (!error) n += 1;
      continue;
    }

    if (row.requester_id === companyId) {
      const { error } = await supabase.rpc("withdraw_partnership", {
        p_partnership_id: row.id,
      });
      if (!error) n += 1;
      continue;
    }

    const { error } = await supabase
      .from("partnerships")
      .update({
        status: "cancelled",
        responded_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .eq("status", "pending");
    if (!error) n += 1;
  }
  return n;
}
