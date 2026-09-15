import "server-only";

import type { AdminCompanyRow } from "@/features/admin/types";
import { createAdminClient } from "@/lib/supabase/admin";

const SELECT =
  "id, name, slug, claimed, verified, plan, website, created_at, staff_hidden_at";

export function mapAdminCompanyRow(r: {
  id: string;
  name: string;
  slug: string;
  claimed: boolean | null;
  verified: boolean | null;
  plan: string | null;
  website: string | null;
  created_at: string;
  staff_hidden_at: string | null;
}): AdminCompanyRow {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    claimed: Boolean(r.claimed),
    verified: Boolean(r.verified),
    plan: r.plan,
    website: r.website,
    createdAt: r.created_at,
    staffHiddenAt: r.staff_hidden_at,
  };
}

export function adminCompanyNeedle(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/[%_,]/g, "").slice(0, 80);
}

/** Offset/limit paginated companies list for the `/admin/companies` panel. */
export async function listAdminCompanies(
  limit = 100,
  offset = 0,
  q?: string,
): Promise<{ rows: AdminCompanyRow[]; hasMore: boolean }> {
  const admin = createAdminClient();
  if (!admin) return { rows: [], hasMore: false };

  const term = adminCompanyNeedle(q);
  let query = admin
    .from("companies")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (term) {
    query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);
  }

  const { data } = await query;
  const rows = (data ?? []).slice(0, limit).map(mapAdminCompanyRow);
  return { rows, hasMore: (data?.length ?? 0) > limit };
}
