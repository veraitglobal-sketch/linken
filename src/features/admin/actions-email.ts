"use server";

import { revalidatePath } from "next/cache";
import { emailDomain } from "@/features/verification/domain";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { runAdminAction } from "@/features/admin/run-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";

export async function adminAddSuppression(formData: FormData) {
  const actor = await requirePlatformStaff("admin");
  const kind = String(formData.get("kind") ?? "");
  const rawValue = String(formData.get("value") ?? "").trim().toLowerCase();
  const reason = String(formData.get("reason") ?? "");
  if ((kind !== "address" && kind !== "domain") || !rawValue) {
    return { ok: false as const, error: "Invalid kind or value." };
  }
  const value = kind === "address" ? rawValue : (emailDomain(`x@${rawValue}`) ?? rawValue);

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const result = await runAdminAction({
    actor,
    action: "email.suppress.add",
    target: { type: "email_suppression", id: value },
    reason,
    before: null,
    run: async () => {
      const { error } = await admin
        .from("email_suppressions")
        .upsert(
          { kind, value, reason, created_by: actor.user.id },
          { onConflict: "kind,value" },
        );
      if (error) throw new Error(error.message);
      return { result: true, after: { kind, value } };
    },
  });

  if (result.ok) revalidatePath("/admin/email");
  return result.ok ? { ok: true as const } : { ok: false as const, error: result.error };
}

export async function adminRemoveSuppression(formData: FormData) {
  const actor = await requirePlatformStaff("admin");
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "");
  if (!id) return { ok: false as const, error: "Missing suppression." };

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const { data: before } = await admin
    .from("email_suppressions")
    .select("kind, value")
    .eq("id", id)
    .maybeSingle();

  const result = await runAdminAction({
    actor,
    action: "email.suppress.remove",
    target: { type: "email_suppression", id },
    reason,
    before,
    run: async () => {
      const { error } = await admin.from("email_suppressions").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { result: true, after: null };
    },
  });

  if (result.ok) revalidatePath("/admin/email");
  return result.ok ? { ok: true as const } : { ok: false as const, error: result.error };
}

const RATE_LIMIT_TABLES = {
  domain_verification_email: { table: "domain_verification_email_send_limits", column: "email" },
  domain_verification_discovery: { table: "domain_verification_discovery_limits", column: "company_id" },
  testimonial_confirm_ensure: { table: "testimonial_confirm_ensure_limits", column: "confirm_token" },
} as const;

export async function adminResetRateLimit(formData: FormData) {
  const actor = await requirePlatformStaff("admin");
  const limitType = String(formData.get("limitType") ?? "");
  const key = String(formData.get("key") ?? "").trim();
  const reason = String(formData.get("reason") ?? "");
  const entry = (RATE_LIMIT_TABLES as Record<string, { table: string; column: string }>)[limitType];
  if (!entry || !key) return { ok: false as const, error: "Invalid limit type or key." };

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const result = await runAdminAction({
    actor,
    action: "email.rate_limit.reset",
    target: { type: limitType, id: key },
    reason,
    before: null,
    run: async () => {
      const { error } = await admin.from(entry.table).delete().eq(entry.column, key);
      if (error) throw new Error(error.message);
      return { result: true, after: { cleared: true } };
    },
  });

  if (result.ok) revalidatePath("/admin/email");
  return result.ok ? { ok: true as const } : { ok: false as const, error: result.error };
}
