"use server";

import { revalidatePath } from "next/cache";
import { generateApiKey } from "@/features/agent-api/auth";
import {
  AGENT_SCOPES,
  type AgentApiKeyRow,
  type AgentScope,
} from "@/features/agent-api/types";
import { getOwnedActiveCompany } from "@/features/workspace/require-owned";

async function requireOwnerCompany() {
  return getOwnedActiveCompany();
}

export async function listApiKeys(): Promise<AgentApiKeyRow[]> {
  const { supabase, company } = await requireOwnerCompany();
  if (!company) return [];

  const { data, error } = await supabase
    .from("api_keys")
    .select(
      "id, name, key_prefix, scopes, created_at, last_used_at, revoked_at",
    )
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listApiKeys]", error.message);
    return [];
  }

  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    key_prefix: r.key_prefix as string,
    scopes: (r.scopes as AgentScope[]) ?? [],
    created_at: r.created_at as string,
    last_used_at: (r.last_used_at as string | null) ?? null,
    revoked_at: (r.revoked_at as string | null) ?? null,
  }));
}

export async function listRecentAudit(limit = 50) {
  const { supabase, company } = await requireOwnerCompany();
  if (!company) return [];

  const { data, error } = await supabase
    .from("api_audit_log")
    .select("id, method, path, action, status, summary, created_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[listRecentAudit]", error.message);
    return [];
  }
  return data ?? [];
}

export type CreateKeyResult =
  | {
      ok: true;
      id: string;
      name: string;
      key: string;
      key_prefix: string;
      scopes: AgentScope[];
    }
  | { ok: false; error: string };

export async function createApiKeyAction(input: {
  name: string;
  scopes: string[];
}): Promise<CreateKeyResult> {
  const { supabase, user, company } = await requireOwnerCompany();
  if (!user || !company) {
    return { ok: false, error: "Sign in as a company owner." };
  }

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };

  const scopes = input.scopes.filter((s): s is AgentScope =>
    (AGENT_SCOPES as readonly string[]).includes(s),
  );
  if (scopes.length === 0) {
    return { ok: false, error: "Select at least one scope." };
  }

  const generated = generateApiKey();

  const { data: keyId, error } = await supabase.rpc("create_api_key", {
    p_company_id: company.id,
    p_name: name,
    p_scopes: scopes,
    p_key_hash: generated.hash,
    p_key_prefix: generated.prefix,
  });

  if (error || !keyId) {
    return {
      ok: false,
      error: error?.message ?? "Could not create API key.",
    };
  }

  revalidatePath("/dashboard/api");
  return {
    ok: true,
    id: keyId as string,
    name,
    key: generated.raw,
    key_prefix: generated.prefix,
    scopes,
  };
}

export async function revokeApiKeyAction(
  keyId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, user, company } = await requireOwnerCompany();
  if (!user || !company) {
    return { ok: false, error: "Sign in as a company owner." };
  }
  if (!keyId) return { ok: false, error: "Missing key id." };

  const { error } = await supabase.rpc("revoke_api_key", {
    p_key_id: keyId,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/api");
  return { ok: true };
}
