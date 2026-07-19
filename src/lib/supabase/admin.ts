import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client for server-only operations that must bypass RLS,
 * e.g. resolving claim tokens (never exposed to browser clients).
 * Returns null when SUPABASE_SERVICE_ROLE_KEY is not configured.
 * NEVER import this from client components.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
