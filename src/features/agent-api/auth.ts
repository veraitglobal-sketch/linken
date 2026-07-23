import "server-only";
import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import {
  AGENT_RATE_LIMIT_PER_MINUTE,
  checkAgentRateLimit,
} from "@/features/agent-api/rate-limit";
import type { AgentAuthContext, AgentScope } from "@/features/agent-api/types";
import { createAdminClient } from "@/lib/supabase/admin";

const LAST_USED_THROTTLE_MS = 60_000;
const lastUsedTouched = new Map<string, number>();

export type AuthFailure = {
  ok: false;
  status: number;
  code:
    | "unauthorized"
    | "invalid_key"
    | "insufficient_scope"
    | "rate_limited"
    | "service_unavailable";
  message: string;
  retryAfter?: number;
};

export type AuthSuccess = {
  ok: true;
  ctx: AgentAuthContext;
};

export type AuthResult = AuthSuccess | AuthFailure;

/** Current prefix for new keys — Hansala. Legacy `lk_` (Linken) still validates. */
export const AGENT_KEY_PREFIX = "hs_";

const LEGACY_AGENT_KEY_PREFIX = "lk_";

export function isAgentApiKey(raw: string): boolean {
  return (
    raw.startsWith(AGENT_KEY_PREFIX) || raw.startsWith(LEGACY_AGENT_KEY_PREFIX)
  );
}

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const raw = `${AGENT_KEY_PREFIX}${hex}`;
  return {
    raw,
    prefix: raw.slice(0, 11), // "hs_" + 8 hex
    hash: hashApiKey(raw),
  };
}

function extractBearer(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  if (!match) return null;
  return match[1] ?? null;
}

/**
 * Authenticate an Agent API request.
 * Hard-scopes all subsequent work to companyId on the key.
 */
export async function authenticateAgentRequest(
  request: NextRequest,
  requiredScope: AgentScope,
): Promise<AuthResult> {
  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      status: 503,
      code: "service_unavailable",
      message: "Agent API is unavailable — service role is not configured.",
    };
  }

  const raw = extractBearer(request);
  if (!raw || !isAgentApiKey(raw)) {
    return {
      ok: false,
      status: 401,
      code: "unauthorized",
      message: "Missing or invalid Authorization Bearer token.",
    };
  }

  const keyHash = hashApiKey(raw);
  const { data: row, error } = await admin
    .from("api_keys")
    .select("id, company_id, scopes, revoked_at")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error || !row || row.revoked_at) {
    return {
      ok: false,
      status: 401,
      code: "invalid_key",
      message: "API key is invalid or revoked.",
    };
  }

  const scopes = (row.scopes ?? []) as AgentScope[];
  if (!scopes.includes(requiredScope)) {
    return {
      ok: false,
      status: 403,
      code: "insufficient_scope",
      message: `This key lacks the '${requiredScope}' scope.`,
    };
  }

  const retryAfter = checkAgentRateLimit(row.id as string);
  if (retryAfter != null) {
    return {
      ok: false,
      status: 429,
      code: "rate_limited",
      message: `Rate limit exceeded (${AGENT_RATE_LIMIT_PER_MINUTE} requests/minute per key).`,
      retryAfter,
    };
  }

  // Fire-and-forget last_used_at — throttle to 1×/min per key
  const now = Date.now();
  const last = lastUsedTouched.get(row.id as string) ?? 0;
  if (now - last >= LAST_USED_THROTTLE_MS) {
    lastUsedTouched.set(row.id as string, now);
    void admin
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", row.id)
      .then(({ error: touchErr }) => {
        if (touchErr) console.error("[api_keys.last_used_at]", touchErr.message);
      });
  }

  return {
    ok: true,
    ctx: {
      companyId: row.company_id as string,
      keyId: row.id as string,
      scopes,
    },
  };
}
