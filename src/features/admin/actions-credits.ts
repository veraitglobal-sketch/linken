"use server";

import { revalidatePath } from "next/cache";
import type { CompanyPlan } from "@/features/plan/entitlements";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { runAdminAction } from "@/features/admin/run-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";

function revalidateCompany(id: string, slug?: string) {
  revalidatePath(`/admin/companies/${id}`);
  revalidatePath("/admin/companies");
  if (slug) revalidatePath(`/c/${slug}`);
}

export async function adminGrantCredits(formData: FormData) {
  const actor = await requirePlatformStaff("admin");
  const companyId = String(formData.get("companyId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const reason = String(formData.get("reason") ?? "");
  if (!companyId || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false as const, error: "Invalid company or amount." };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const { data: before } = await admin
    .from("company_credits")
    .select("balance")
    .eq("company_id", companyId)
    .maybeSingle();

  const result = await runAdminAction({
    actor,
    action: "credits.grant",
    target: { type: "company", id: companyId },
    reason,
    before: { balance: before?.balance ?? 0 },
    run: async () => {
      const { data, error } = await admin.rpc("admin_grant_credits", {
        p_company_id: companyId,
        p_amount: Math.floor(amount),
        p_reason: "admin",
      });
      if (error) throw new Error(error.message);
      return { result: data as number, after: { balance: data } };
    },
  });

  if (result.ok) revalidateCompany(companyId);
  return result.ok
    ? { ok: true as const, balance: result.result }
    : { ok: false as const, error: result.error };
}

export async function adminToggleRadar(formData: FormData) {
  const actor = await requirePlatformStaff("admin");
  const companyId = String(formData.get("companyId") ?? "");
  const enabled = String(formData.get("enabled") ?? "") === "true";
  const reason = String(formData.get("reason") ?? "");
  if (!companyId) return { ok: false as const, error: "Missing company." };

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const { data: before } = await admin
    .from("companies")
    .select("radar, slug")
    .eq("id", companyId)
    .maybeSingle();

  const result = await runAdminAction({
    actor,
    action: enabled ? "radar.enable" : "radar.disable",
    target: { type: "company", id: companyId },
    reason,
    before: { radar: Boolean(before?.radar) },
    run: async () => {
      const { error } = await admin
        .from("companies")
        .update({ radar: enabled })
        .eq("id", companyId);
      if (error) throw new Error(error.message);
      return { result: true, after: { radar: enabled } };
    },
  });

  if (result.ok) revalidateCompany(companyId, before?.slug as string | undefined);
  return result.ok
    ? { ok: true as const }
    : { ok: false as const, error: result.error };
}

export async function adminSetPlan(formData: FormData) {
  const actor = await requirePlatformStaff("admin");
  const companyId = String(formData.get("companyId") ?? "");
  const plan = String(formData.get("plan") ?? "") as CompanyPlan;
  const reason = String(formData.get("reason") ?? "");
  if (!companyId || !["free", "pro", "founding"].includes(plan)) {
    return { ok: false as const, error: "Invalid company or plan." };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const { data: before } = await admin
    .from("companies")
    .select("plan, slug")
    .eq("id", companyId)
    .maybeSingle();

  const result = await runAdminAction({
    actor,
    action: "plan.set",
    target: { type: "company", id: companyId },
    reason,
    before: { plan: before?.plan ?? null },
    run: async () => {
      // Conflict: Stripe webhooks remain source of truth and can overwrite.
      const { error } = await admin
        .from("companies")
        .update({ plan })
        .eq("id", companyId);
      if (error) throw new Error(error.message);
      return { result: true, after: { plan } };
    },
  });

  if (result.ok) revalidateCompany(companyId, before?.slug as string | undefined);
  return result.ok
    ? { ok: true as const }
    : { ok: false as const, error: result.error };
}
