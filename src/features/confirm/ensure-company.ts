import "server-only";

import { insertMinimalOwnedCompany } from "@/features/company/create-minimal";
import { getOwnedActiveCompany } from "@/features/workspace/require-owned";

/** Logged-in owner, creating a profile from the invite name when needed. */
export async function ensureOwnedCompanyForConfirm(suggestedName: string) {
  const { supabase, user, company } = await getOwnedActiveCompany();
  if (!user) {
    return {
      ok: false as const,
      reason: "unauthenticated" as const,
      error: "Sign in to confirm.",
    };
  }
  if (company) {
    return { ok: true as const, supabase, user, company };
  }

  const created = await insertMinimalOwnedCompany(
    supabase,
    user.id,
    suggestedName,
  );
  if (!created.ok) {
    return {
      ok: false as const,
      reason: "create_failed" as const,
      error: created.error,
    };
  }
  return { ok: true as const, supabase, user, company: created.company };
}
