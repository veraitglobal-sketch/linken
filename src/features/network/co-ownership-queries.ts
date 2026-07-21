import "server-only";

import { createClient } from "@/lib/supabase/server";

export type CoOwnerProposal = {
  id: string;
  groupId: string;
  childCompanyId: string;
  childName: string;
  childSlug: string;
  coParentCompanyId: string;
  coParentName: string;
  coParentSlug: string;
  proposedByCompanyId: string;
  ownershipPercentage: number | null;
  ownershipType: string | null;
  createdAt: string;
};

/** Pending co-ownership proposals where the viewer must respond (not the proposer). */
export async function getPendingCoOwnerProposals(
  companyId: string,
): Promise<CoOwnerProposal[]> {
  if (!companyId) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
      "get_pending_co_owner_proposals",
      { p_company_id: companyId },
    );
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((row) => ({
      id: row.id as string,
      groupId: row.group_id as string,
      childCompanyId: row.child_company_id as string,
      childName: row.child_name as string,
      childSlug: row.child_slug as string,
      coParentCompanyId: row.co_parent_company_id as string,
      coParentName: row.co_parent_name as string,
      coParentSlug: row.co_parent_slug as string,
      proposedByCompanyId: row.proposed_by_company_id as string,
      ownershipPercentage: (row.ownership_percentage as number | null) ?? null,
      ownershipType: (row.ownership_type as string | null) ?? null,
      createdAt: row.created_at as string,
    }));
  } catch {
    return [];
  }
}

export type ConfirmedCoOwnership = {
  id: string;
  childCompanyId: string;
  childName: string;
  childSlug: string;
  coParentCompanyId: string;
  coParentName: string;
  coParentSlug: string;
  ownershipPercentage: number | null;
  ownershipType: string | null;
};

/** Confirmed shared-ownership links visible to the viewer within a group. */
export async function getConfirmedCoOwnershipsForGroup(
  groupId: string,
): Promise<ConfirmedCoOwnership[]> {
  if (!groupId) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("company_co_owners")
      .select(
        "id, child_company_id, co_parent_company_id, ownership_percentage, ownership_type, child:companies!child_company_id(name, slug), co_parent:companies!co_parent_company_id(name, slug)",
      )
      .eq("group_id", groupId)
      .eq("status", "confirmed");
    if (error || !data) return [];

    return data
      .map((row) => {
        const child = Array.isArray(row.child) ? row.child[0] : row.child;
        const coParent = Array.isArray(row.co_parent)
          ? row.co_parent[0]
          : row.co_parent;
        if (!child || !coParent) return null;
        return {
          id: row.id as string,
          childCompanyId: row.child_company_id as string,
          childName: child.name as string,
          childSlug: child.slug as string,
          coParentCompanyId: row.co_parent_company_id as string,
          coParentName: coParent.name as string,
          coParentSlug: coParent.slug as string,
          ownershipPercentage: (row.ownership_percentage as number | null) ?? null,
          ownershipType: (row.ownership_type as string | null) ?? null,
        };
      })
      .filter(Boolean) as ConfirmedCoOwnership[];
  } catch {
    return [];
  }
}

export type ExternalPartnerOption = { id: string; name: string };

/** Confirmed partners of any group member, outside the group — eligible co-owners. */
export async function getExternalPartnersForGroup(
  memberCompanyIds: string[],
): Promise<ExternalPartnerOption[]> {
  if (memberCompanyIds.length === 0) return [];
  try {
    const supabase = await createClient();
    const memberSet = new Set(memberCompanyIds);
    const { data, error } = await supabase
      .from("partnerships")
      .select(
        "requester_id, recipient_id, requester:companies!requester_id(id, name), recipient:companies!recipient_id(id, name)",
      )
      .eq("status", "accepted")
      .or(
        `requester_id.in.(${memberCompanyIds.join(",")}),recipient_id.in.(${memberCompanyIds.join(",")})`,
      );
    if (error || !data) return [];

    const out = new Map<string, ExternalPartnerOption>();
    for (const row of data) {
      const requesterId = row.requester_id as string;
      const recipientId = row.recipient_id as string;
      const other = memberSet.has(requesterId)
        ? row.recipient
        : memberSet.has(recipientId)
          ? row.requester
          : null;
      const otherRow = Array.isArray(other) ? other[0] : other;
      if (!otherRow?.id || memberSet.has(otherRow.id as string)) continue;
      out.set(otherRow.id as string, {
        id: otherRow.id as string,
        name: otherRow.name as string,
      });
    }
    return [...out.values()];
  } catch {
    return [];
  }
}
