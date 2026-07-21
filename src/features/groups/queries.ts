import { getTrustProfile } from "@/features/trust/queries";
import { buildMemberTree } from "@/features/groups/tree";
import type {
  ConfirmedGroupBadge,
  GroupMemberCard,
  GroupPublicPage,
  OwnedGroupMembership,
  PendingGroupInvite,
  PendingParentProposal,
} from "@/features/groups/types";
import { createClient } from "@/lib/supabase/server";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

async function toMemberCard(row: {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  city: string | null;
  country: string | null;
  claimed: boolean | null;
  logo_url?: string | null;
  parentCompanyId?: string | null;
}): Promise<GroupMemberCard> {
  const trust = await getTrustProfile(row.id, row.slug);
  return {
    companyId: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category ?? "",
    city: row.city ?? "",
    country: row.country ?? "",
    logoInitials: initials(row.name),
    logoUrl: row.logo_url ?? null,
    claimed: row.claimed !== false,
    trustLevel: trust.level,
    confirmedReferences:
      trust.breakdown.confirmedReferences + trust.breakdown.ongoingReferences,
    parentCompanyId: row.parentCompanyId ?? null,
  };
}

type CompanyJoin = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  city: string | null;
  country: string | null;
  claimed: boolean | null;
  logo_url?: string | null;
};

function unwrapCompany(c: CompanyJoin | CompanyJoin[] | null) {
  return Array.isArray(c) ? c[0] : c;
}

/** Public group page — confirmed members only. */
export async function getGroupBySlug(
  slug: string,
): Promise<GroupPublicPage | null> {
  try {
    const supabase = await createClient();
    const { data: group } = await supabase
      .from("company_groups")
      .select(
        "id, name, slug, description, website, logo_url, logo_source, created_by, created_at",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (!group) return null;

    const { data: memberships } = await supabase
      .from("company_group_members")
      .select(
        "parent_company_id, company:companies!company_id(id, slug, name, category, city, country, claimed, logo_url)",
      )
      .eq("group_id", group.id)
      .eq("status", "confirmed");

    const rows = (memberships ?? [])
      .map((m) => {
        const company = unwrapCompany(m.company as CompanyJoin | CompanyJoin[] | null);
        if (!company) return null;
        return {
          ...company,
          parentCompanyId: (m.parent_company_id as string | null) ?? null,
        };
      })
      .filter(Boolean) as (CompanyJoin & { parentCompanyId: string | null })[];

    const members = await Promise.all(rows.map((c) => toMemberCard(c)));
    const tree = buildMemberTree(members);
    const countries = new Set(
      members.map((m) => m.country).filter((c) => Boolean(c)),
    );

    return {
      group: {
        id: group.id,
        name: group.name,
        slug: group.slug,
        description: group.description ?? "",
        website: group.website ?? "",
        logoUrl: group.logo_url ?? null,
        logoSource: group.logo_source ?? null,
        createdBy: group.created_by,
        createdAt: group.created_at,
      },
      members,
      tree,
      companyCount: members.length,
      countryCount: countries.size,
    };
  } catch {
    return null;
  }
}

export async function getConfirmedGroupForCompany(
  companyId: string,
): Promise<ConfirmedGroupBadge | null> {
  if (!companyId || companyId.length < 20) return null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("company_group_members")
      .select("group:company_groups!group_id(name, slug)")
      .eq("company_id", companyId)
      .eq("status", "confirmed")
      .limit(1)
      .maybeSingle();

    if (data?.group) {
      const g = Array.isArray(data.group) ? data.group[0] : data.group;
      if (g?.slug) return { name: g.name, slug: g.slug };
    }

    // The company itself isn't a member row — check if it's the group's
    // creator (owner) instead. A group's parent company gets no membership
    // row of its own, but should still show the badge once the group has
    // at least one confirmed member.
    const { data: company } = await supabase
      .from("companies")
      .select("owner_id")
      .eq("id", companyId)
      .maybeSingle();
    if (!company?.owner_id) return null;

    const { data: ownedGroup } = await supabase
      .from("company_groups")
      .select("name, slug, members:company_group_members!group_id(status)")
      .eq("created_by", company.owner_id)
      .limit(1)
      .maybeSingle();

    if (!ownedGroup?.slug) return null;
    const hasConfirmedMember = (ownedGroup.members ?? []).some(
      (m: { status: string }) => m.status === "confirmed",
    );
    if (!hasConfirmedMember) return null;

    return { name: ownedGroup.name, slug: ownedGroup.slug };
  } catch {
    return null;
  }
}

export {
  getDashboardGroupById,
  getDashboardGroupForCreator,
} from "@/features/groups/dashboard-group";

export async function getPendingGroupInvitesForOwner(): Promise<
  PendingGroupInvite[]
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: owned } = await supabase
      .from("companies")
      .select("id, name")
      .eq("owner_id", user.id)
      .eq("claimed", true);

    if (!owned?.length) return [];

    const ids = owned.map((c) => c.id);
    const nameById = new Map(owned.map((c) => [c.id, c.name]));

    const { data: invites } = await supabase
      .from("company_group_members")
      .select(
        "group_id, company_id, invited_at, parent_company_id, group:company_groups!group_id(name, slug)",
      )
      .in("company_id", ids)
      .eq("status", "pending");

    return (invites ?? [])
      .map((row) => {
        const g = Array.isArray(row.group) ? row.group[0] : row.group;
        if (!g) return null;
        return {
          groupId: row.group_id as string,
          groupName: g.name as string,
          groupSlug: g.slug as string,
          companyId: row.company_id as string,
          companyName: nameById.get(row.company_id as string) ?? "Your company",
          invitedAt: row.invited_at as string,
          parentCompanyId: (row.parent_company_id as string | null) ?? null,
        };
      })
      .filter(Boolean) as PendingGroupInvite[];
  } catch {
    return [];
  }
}

export async function getPendingParentProposalsForOwner(): Promise<
  PendingParentProposal[]
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: owned } = await supabase
      .from("companies")
      .select("id, name")
      .eq("owner_id", user.id)
      .eq("claimed", true);
    if (!owned?.length) return [];

    const ids = owned.map((c) => c.id);
    const nameById = new Map(owned.map((c) => [c.id, c.name]));

    const { data: rows } = await supabase
      .from("company_group_members")
      .select(
        "group_id, company_id, pending_parent_company_id, group:company_groups!group_id(name, slug)",
      )
      .in("company_id", ids)
      .eq("status", "confirmed")
      .not("pending_parent_company_id", "is", null);

    const parentIds = [
      ...new Set(
        (rows ?? [])
          .map((r) => r.pending_parent_company_id as string)
          .filter(Boolean),
      ),
    ];
    const parentNames = new Map<string, string>();
    if (parentIds.length) {
      const { data: parents } = await supabase
        .from("companies")
        .select("id, name")
        .in("id", parentIds);
      for (const p of parents ?? []) parentNames.set(p.id, p.name);
    }

    return (rows ?? [])
      .map((row) => {
        const g = Array.isArray(row.group) ? row.group[0] : row.group;
        const parentId = row.pending_parent_company_id as string;
        if (!g || !parentId) return null;
        return {
          groupId: row.group_id as string,
          groupName: g.name as string,
          groupSlug: g.slug as string,
          companyId: row.company_id as string,
          companyName: nameById.get(row.company_id as string) ?? "Your company",
          parentCompanyId: parentId,
          parentName: parentNames.get(parentId) ?? "Parent company",
        };
      })
      .filter(Boolean) as PendingParentProposal[];
  } catch {
    return [];
  }
}

/** Confirmed group memberships for companies the viewer owns. */
export async function getOwnedGroupMemberships(): Promise<OwnedGroupMembership[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: owned } = await supabase
      .from("companies")
      .select("id, name, slug")
      .eq("owner_id", user.id)
      .eq("claimed", true);
    if (!owned?.length) return [];

    const byId = new Map(owned.map((c) => [c.id, c]));
    const { data: rows } = await supabase
      .from("company_group_members")
      .select("group_id, company_id, group:company_groups!group_id(name, slug)")
      .in(
        "company_id",
        owned.map((c) => c.id),
      )
      .eq("status", "confirmed");

    return (rows ?? [])
      .map((row) => {
        const g = Array.isArray(row.group) ? row.group[0] : row.group;
        const c = byId.get(row.company_id as string);
        if (!g || !c) return null;
        return {
          groupId: row.group_id as string,
          groupName: g.name as string,
          groupSlug: g.slug as string,
          companyId: c.id,
          companyName: c.name,
          companySlug: c.slug,
        };
      })
      .filter(Boolean) as OwnedGroupMembership[];
  } catch {
    return [];
  }
}

export async function listGroupSlugs(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("company_groups")
      .select("slug")
      .order("name")
      .limit(500);
    return (data ?? []).map((r) => r.slug as string);
  } catch {
    return [];
  }
}
