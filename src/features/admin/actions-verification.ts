"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { runAdminAction } from "@/features/admin/run-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";

const VERIFICATION_METHODS = ["email_domain", "dns_txt", "meta_tag"] as const;
type VerificationMethod = (typeof VERIFICATION_METHODS)[number];

export async function revokeVerification(formData: FormData) {
  const actor = await requirePlatformStaff("admin");
  const companyId = String(formData.get("companyId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  if (!companyId) return { ok: false as const, error: "Missing company." };

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const { data: before } = await admin
    .from("company_verifications")
    .select("verification_method, verified_at")
    .eq("company_id", companyId)
    .maybeSingle();

  const result = await runAdminAction({
    actor,
    action: "verification.revoke",
    target: { type: "company", id: companyId },
    reason,
    before: before ?? null,
    run: async () => {
      const { error } = await admin.rpc("set_domain_unverified", {
        p_company_id: companyId,
      });
      if (error) throw new Error(error.message);
      return { result: true, after: { verified: false } };
    },
  });

  if (result.ok) revalidatePath("/admin/verification");
  return result.ok
    ? { ok: true as const }
    : { ok: false as const, error: result.error };
}

/**
 * Manual grant bypasses the customer's own domain proof — owner-only, rare,
 * always audited with the typed confirmation enforced client-side.
 */
export async function grantVerification(formData: FormData) {
  const actor = await requirePlatformStaff("owner");
  const companyId = String(formData.get("companyId") ?? "");
  const method = String(formData.get("method") ?? "");
  const reason = String(formData.get("reason") ?? "");
  if (
    !companyId ||
    !VERIFICATION_METHODS.includes(method as VerificationMethod)
  ) {
    return { ok: false as const, error: "Invalid company or method." };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const result = await runAdminAction({
    actor,
    action: "verification.grant",
    target: { type: "company", id: companyId },
    reason,
    before: null,
    run: async () => {
      const { error } = await admin.rpc("set_domain_verified", {
        p_company_id: companyId,
        p_method: method,
      });
      if (error) throw new Error(error.message);
      return { result: true, after: { verified: true, method } };
    },
  });

  if (result.ok) revalidatePath("/admin/verification");
  return result.ok
    ? { ok: true as const }
    : { ok: false as const, error: result.error };
}
