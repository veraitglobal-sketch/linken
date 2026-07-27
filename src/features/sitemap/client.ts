import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Prefer service role so crawlers never depend on auth cookies. */
export async function getSitemapDb(): Promise<SupabaseClient | null> {
  return createAdminClient() ?? (await createClient());
}
