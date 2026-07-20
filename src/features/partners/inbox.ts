import { createClient } from "@/lib/supabase/server";

export type PartnershipRow = {
  id: string;
  status: "pending" | "accepted" | "cancelled" | "declined";
  direction: "outgoing" | "incoming";
  createdAt?: string;
  other: {
    id: string;
    slug: string;
    name: string;
    category: string;
    city: string;
    verified: boolean;
    claimed: boolean;
  };
};

/** Pending + accepted partnerships for the viewer's company. */
export async function getPartnershipInbox(
  companyId: string,
): Promise<{
  outgoingPending: PartnershipRow[];
  incomingPending: PartnershipRow[];
  accepted: PartnershipRow[];
}> {
  const empty = {
    outgoingPending: [] as PartnershipRow[],
    incomingPending: [] as PartnershipRow[],
    accepted: [] as PartnershipRow[],
  };
  if (!companyId) return empty;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("partnerships")
      .select(
        `
        id,
        status,
        created_at,
        requester_id,
        recipient_id,
        requester:companies!requester_id(id, slug, name, category, city, verified, claimed),
        recipient:companies!recipient_id(id, slug, name, category, city, verified, claimed)
      `,
      )
      .or(`requester_id.eq.${companyId},recipient_id.eq.${companyId}`)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false });

    if (error || !data) return empty;

    const outgoingPending: PartnershipRow[] = [];
    const incomingPending: PartnershipRow[] = [];
    const accepted: PartnershipRow[] = [];

    for (const row of data) {
      const outgoing = row.requester_id === companyId;
      const otherRaw = outgoing ? row.recipient : row.requester;
      const other = Array.isArray(otherRaw) ? otherRaw[0] : otherRaw;
      if (!other) continue;

      const item: PartnershipRow = {
        id: row.id as string,
        status: row.status as PartnershipRow["status"],
        direction: outgoing ? "outgoing" : "incoming",
        createdAt: (row.created_at as string | undefined) ?? undefined,
        other: {
          id: other.id as string,
          slug: other.slug as string,
          name: other.name as string,
          category: (other.category as string) ?? "",
          city: (other.city as string) ?? "",
          verified: Boolean(other.verified),
          claimed: other.claimed !== false,
        },
      };

      if (row.status === "accepted") accepted.push(item);
      else if (outgoing) outgoingPending.push(item);
      else incomingPending.push(item);
    }

    return { outgoingPending, incomingPending, accepted };
  } catch {
    return empty;
  }
}
