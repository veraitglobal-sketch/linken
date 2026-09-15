import "server-only";

import { companyDisplayLogoUrl } from "@/features/logo/display-url";
import type { WorkspaceContext } from "@/features/workspace/types";
import type { SupabaseClient } from "@supabase/supabase-js";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  created_at: string | null;
};

function toOperatorContext(c: CompanyRow): WorkspaceContext {
  return {
    type: "company",
    id: c.id,
    name: c.name,
    slug: c.slug,
    logoUrl: companyDisplayLogoUrl({
      logoUrl: c.logo_url,
      website: c.website,
    }),
    website: c.website,
    initials: initials(c.name),
    role: "operator",
    createdAt: c.created_at ?? new Date(0).toISOString(),
    claimed: false,
  };
}

/** Unclaimed firms this admin may open: own branches, and confirmed joint firms. */
export async function loadUnclaimedOperatorContexts(
  supabase: SupabaseClient,
  creatorIds: string[],
  seen: Set<string>,
): Promise<WorkspaceContext[]> {
  if (creatorIds.length === 0) return [];

  const [{ data: branches }, { data: coOwned }] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, slug, logo_url, website, created_at, created_by_company_id")
      .eq("claimed", false)
      .in("created_by_company_id", creatorIds),
    supabase
      .from("company_co_owners")
      .select(
        "child:companies!child_company_id(id, name, slug, logo_url, website, claimed, created_at)",
      )
      .eq("status", "confirmed")
      .in("co_parent_company_id", creatorIds),
  ]);

  const candidates: CompanyRow[] = [];
  for (const c of branches ?? []) {
    candidates.push(c as CompanyRow);
  }
  for (const row of coOwned ?? []) {
    const child = Array.isArray(row.child) ? row.child[0] : row.child;
    if (!child || child.claimed !== false) continue;
    candidates.push(child as CompanyRow);
  }

  const ids = candidates.map((c) => c.id);
  const inGroup = new Set<string>();
  if (ids.length > 0) {
    const { data: memberships } = await supabase
      .from("company_group_members")
      .select("company_id")
      .in("company_id", ids)
      .eq("status", "confirmed");
    for (const m of memberships ?? []) inGroup.add(m.company_id as string);
  }

  const out: WorkspaceContext[] = [];
  for (const c of candidates) {
    if (seen.has(c.id) || !inGroup.has(c.id)) continue;
    seen.add(c.id);
    out.push(toOperatorContext(c));
  }
  return out;
}
