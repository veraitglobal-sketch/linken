import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Resolve owner emails via Auth Admin API (service role only). */
export async function resolveOwnerEmails(
  admin: SupabaseClient,
  ownerIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unique = [...new Set(ownerIds.filter(Boolean))];

  await Promise.all(
    unique.map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id);
      const email = data.user?.email?.trim();
      if (email) map.set(id, email);
    }),
  );

  return map;
}
