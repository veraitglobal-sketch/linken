import "server-only";
import { hashApiKey, isAgentApiKey } from "@/features/agent-api/auth";
import { createAdminClient } from "@/lib/supabase/admin";

function extractBearer(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

/** Live Agent API key, or null. Hashes only — never logs the raw secret. */
export async function liveAgentBearer(request: Request): Promise<{
  present: boolean;
  key: string | null;
}> {
  const raw = extractBearer(request);
  if (!raw) return { present: false, key: null };
  if (!isAgentApiKey(raw)) return { present: true, key: null };

  const admin = createAdminClient();
  if (!admin) return { present: true, key: null };

  const { data, error } = await admin
    .from("api_keys")
    .select("id, revoked_at")
    .eq("key_hash", hashApiKey(raw))
    .maybeSingle();

  if (error || !data || data.revoked_at) return { present: true, key: null };
  return { present: true, key: raw };
}
