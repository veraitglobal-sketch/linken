import "server-only";

import { getTrustProfile } from "@/features/trust/queries";
import { buildMemberTree } from "@/features/groups/tree";
import type { DashboardGroup, GroupMemberCard } from "@/features/groups/types";
import { createClient } from "@/lib/supabase/server";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

type GroupRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  logo_source: string | null;
  created_by: string;
  created_at: string;
};

async function assembleDashboardGroup(
  group: GroupRow,
): Promise<DashboardGroup> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("company_group_members")
    .select(
      "status, parent_company_id, company:companies!company_id(id, slug, name, category, city, country, claimed, logo_url)",
    )
    .eq("group_id", group.id);

  const pending: DashboardGroup["pending"] = [];
  const confirmedRows: {
    company: CompanyJoin;
    parentCompanyId: string | null;
  }[] = [];

  for (const row of rows ?? []) {
    const company = unwrapCompany(
      row.company as CompanyJoin | CompanyJoin[] | null,
    );
    if (!company) continue;

    if (row.status === "confirmed") {
      confirmedRows.push({
        company,
        parentCompanyId: (row.parent_company_id as string | null) ?? null,
      });
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

  // Each card resolves a trust profile (several queries) — build them all
  // in parallel instead of one member at a time.
  const confirmed: GroupMemberCard[] = await Promise.all(
    confirmedRows.map((r) =>
      toMemberCard({ ...r.company, parentCompanyId: r.parentCompanyId }),
    ),
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
    confirmed,
    tree: buildMemberTree(confirmed),
    pending,
  };
}

const GROUP_SELECT =
  "id, name, slug, description, website, logo_url, logo_source, created_by, created_at";

/** Creator's oldest group (legacy helper). */
export async function getDashboardGroupForCreator(): Promise<DashboardGroup | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: group } = await supabase
      .from("company_groups")
      .select(GROUP_SELECT)
      .eq("created_by", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!group) return null;
    return assembleDashboardGroup(group as GroupRow);
  } catch {
    return null;
  }
}

/** Specific group — only if the signed-in user is the creator. */
export async function getDashboardGroupById(
  groupId: string,
): Promise<DashboardGroup | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: group } = await supabase
      .from("company_groups")
      .select(GROUP_SELECT)
      .eq("id", groupId)
      .eq("created_by", user.id)
      .maybeSingle();

    if (!group) return null;
    return assembleDashboardGroup(group as GroupRow);
  } catch {
    return null;
  }
}
