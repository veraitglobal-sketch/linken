import "server-only";

import { companyDisplayLogoUrl } from "@/features/logo/display-url";
import { sortWorkspaceContexts } from "@/features/workspace/pick-default";
import type {
  WorkspaceContext,
  WorkspaceRole,
} from "@/features/workspace/types";
import { createClient } from "@/lib/supabase/server";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** All workspaces the user can open (preference only — not authorization). */
export async function getWorkspaceContexts(
  userId: string,
): Promise<WorkspaceContext[]> {
  const supabase = await createClient();
  const out: WorkspaceContext[] = [];
  const seen = new Set<string>();

  const { data: memberships } = await supabase
    .from("company_members")
    .select(
      "role, created_at, company:companies!company_id(id, name, slug, logo_url, website, claimed, created_at)",
    )
    .eq("user_id", userId);

  for (const row of memberships ?? []) {
    const company = Array.isArray(row.company) ? row.company[0] : row.company;
    if (!company || company.claimed === false) continue;
    const role = row.role as WorkspaceRole;
    if (role !== "owner" && role !== "admin" && role !== "member") continue;
    seen.add(company.id as string);
    out.push({
      type: "company",
      id: company.id as string,
      name: company.name as string,
      slug: company.slug as string,
      logoUrl: companyDisplayLogoUrl({
        logoUrl: company.logo_url as string | null,
        website: company.website as string | null,
      }),
      website: (company.website as string | null) ?? null,
      initials: initials(company.name as string),
      role,
      createdAt: (company.created_at as string) ?? (row.created_at as string),
      claimed: true,
    });
  }

  // Unclaimed branches where user is admin/owner of the creator firm.
  const { data: adminOf } = await supabase
    .from("company_members")
    .select("company_id, role")
    .eq("user_id", userId)
    .in("role", ["owner", "admin"]);

  const creatorIds = (adminOf ?? []).map((r) => r.company_id as string);
  if (creatorIds.length > 0) {
    const { data: branches } = await supabase
      .from("companies")
      .select(
        "id, name, slug, logo_url, website, claimed, created_at, created_by_company_id",
      )
      .eq("claimed", false)
      .in("created_by_company_id", creatorIds);

    for (const c of branches ?? []) {
      if (seen.has(c.id as string)) continue;
      seen.add(c.id as string);
      out.push({
        type: "company",
        id: c.id as string,
        name: c.name as string,
        slug: c.slug as string,
        logoUrl: companyDisplayLogoUrl({
          logoUrl: c.logo_url as string | null,
          website: c.website as string | null,
        }),
        website: (c.website as string | null) ?? null,
        initials: initials(c.name as string),
        role: "operator",
        createdAt: (c.created_at as string) ?? new Date(0).toISOString(),
        claimed: false,
      });
    }
  }

  const { data: groups } = await supabase
    .from("company_groups")
    .select("id, name, slug, logo_url, website, created_at")
    .eq("created_by", userId);

  for (const g of groups ?? []) {
    out.push({
      type: "group",
      id: g.id as string,
      name: g.name as string,
      slug: g.slug as string,
      logoUrl: companyDisplayLogoUrl({
        logoUrl: g.logo_url as string | null,
        website: g.website as string | null,
      }),
      website: (g.website as string | null) ?? null,
      initials: initials(g.name as string),
      role: "creator",
      createdAt: g.created_at as string,
    });
  }

  return sortWorkspaceContexts(out);
}

