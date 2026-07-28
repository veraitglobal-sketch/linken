"use server";

import { revalidatePath } from "next/cache";
import { mergeCompanies } from "@/features/admin/merge-company";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { runAdminAction } from "@/features/admin/run-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";

export async function adminMergeCompanies(formData: FormData) {
  const actor = await requirePlatformStaff("admin");
  const winnerId = String(formData.get("winnerId") ?? "");
  const loserId = String(formData.get("loserId") ?? "");
  const confirmName = String(formData.get("confirmName") ?? "").trim();
  const reason = String(formData.get("reason") ?? "");

  if (!winnerId || !loserId || winnerId === loserId) {
    return { ok: false as const, error: "Pick two different companies." };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const [{ data: winner }, { data: loser }] = await Promise.all([
    admin.from("companies").select("id, name, slug").eq("id", winnerId).maybeSingle(),
    admin.from("companies").select("id, name, slug").eq("id", loserId).maybeSingle(),
  ]);
  if (!winner || !loser) {
    return { ok: false as const, error: "Company not found." };
  }
  if (confirmName !== loser.name) {
    return { ok: false as const, error: "Typed name does not match the company being merged away." };
  }

  const result = await runAdminAction({
    actor,
    action: "company.merge",
    target: { type: "company", id: winnerId },
    reason,
    before: {
      winner: { id: winner.id, slug: winner.slug },
      loser: { id: loser.id, name: loser.name, slug: loser.slug },
    },
    run: async () => {
      const merge = await mergeCompanies(admin, winnerId, loserId, loser.slug as string);
      return { result: merge, after: merge };
    },
  });

  if (result.ok) {
    revalidatePath("/admin/duplicates");
    revalidatePath("/admin/companies");
    revalidatePath(`/admin/companies/${winnerId}`);
    revalidatePath(`/c/${winner.slug}`);
  }

  return result.ok
    ? { ok: true as const, ...result.result }
    : { ok: false as const, error: result.error };
}
