import "server-only";

import type { AdminCompanyRow } from "@/features/admin/types";
import { createAdminClient } from "@/lib/supabase/admin";

/** Offset/limit paginated companies list for the `/admin/companies` panel. */
export async function listAdminCompanies(
  limit = 100,
  offset = 0,
): Promise<{ rows: AdminCompanyRow[]; hasMore: boolean }> {
  const admin = createAdminClient();
  if (!admin) return { rows: [], hasMore: false };

  const { data } = await admin
    .from("companies")
    .select("id, name, slug, claimed, verified, plan, website, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  const rows = (data ?? []).slice(0, limit).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    slug: r.slug as string,
    claimed: Boolean(r.claimed),
    verified: Boolean(r.verified),
    plan: (r.plan as string | null) ?? null,
    website: (r.website as string | null) ?? null,
    createdAt: r.created_at as string,
  }));

  return { rows, hasMore: (data?.length ?? 0) > limit };
}
