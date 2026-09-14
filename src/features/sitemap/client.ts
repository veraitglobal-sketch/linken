import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

/** Service role only — generateSitemaps cannot call cookies(). */
export async function getSitemapDb(): Promise<SupabaseClient | null> {
  return createAdminClient();
}
