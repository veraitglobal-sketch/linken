import { getTrustProfile } from "@/features/trust/queries";
import { buildMemberTree } from "@/features/groups/tree";
import type {
  ConfirmedGroupBadge,
  DashboardGroup,
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
      .select("id, name, slug, description, website, created_by, created_at")
      .eq("slug", slug)
      .maybeSingle();

    if (!group) return null;

    const { data: memberships } = await supabase
      .from("company_group_members")
      .select(
        "parent_company_id, company:companies!company_id(id, slug, name, category, city, country, claimed)",
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

    if (!data?.group) return null;
    const g = Array.isArray(data.group) ? data.group[0] : data.group;
    if (!g?.slug) return null;
    return { name: g.name, slug: g.slug };
  } catch {
    return null;
  }
}

export async function getDashboardGroupForCreator(): Promise<DashboardGroup | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: group } = await supabase
      .from("company_groups")
      .select("id, name, slug, description, website, created_by, created_at")
      .eq("created_by", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!group) return null;

    const { data: rows } = await supabase
      .from("company_group_members")
      .select(
        "status, parent_company_id, company:companies!company_id(id, slug, name, category, city, country, claimed)",
      )
      .eq("group_id", group.id);

    const confirmed: GroupMemberCard[] = [];
    const pending: DashboardGroup["pending"] = [];

    for (const row of rows ?? []) {
      const company = unwrapCompany(
        row.company as CompanyJoin | CompanyJoin[] | null,
      );
      if (!company) continue;

      if (row.status === "confirmed") {
        confirmed.push(
          await toMemberCard({
            ...company,
            parentCompanyId: row.parent_company_id as string | null,
          }),
        );
      } else if (row.status === "pending") {
        pending.push({
          companyId: company.id,
          slug: company.slug,
          name: company.name,
          city: company.city ?? "",
          country: company.country ?? "",
          parentCompanyId: (row.parent_company_id as string | null) ?? null,
        });
      }
    }

    return {
      group: {
        id: group.id,
        name: group.name,
        slug: group.slug,
        description: group.description ?? "",
        website: group.website ?? "",
        createdBy: group.created_by,
        createdAt: group.created_at,
      },
      confirmed,
      tree: buildMemberTree(confirmed),
      pending,
    };
  } catch {
    return null;
  }
}

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
