"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { runAdminAction } from "@/features/admin/run-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";

function revalidateCompany(id: string, slug?: string) {
  revalidatePath(`/admin/companies/${id}`);
  revalidatePath("/admin/companies");
  revalidatePath("/admin");
  if (slug) {
    revalidatePath(`/c/${slug}`);
    revalidatePath(`/embed/${slug}`);
    revalidatePath("/search");
  }
}

export async function adminHideCompany(formData: FormData) {
  return setHidden(formData, true);
}

export async function adminUnhideCompany(formData: FormData) {
  return setHidden(formData, false);
}

async function setHidden(formData: FormData, hide: boolean) {
  const actor = await requirePlatformStaff("admin");
  const companyId = String(formData.get("companyId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  if (!companyId) return { ok: false as const, error: "Missing company." };

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const { data: before } = await admin
    .from("companies")
    .select("slug, staff_hidden_at")
    .eq("id", companyId)
    .maybeSingle();
  if (!before) return { ok: false as const, error: "Company not found." };

  const at = hide ? new Date().toISOString() : null;
  const result = await runAdminAction({
    actor,
    action: hide ? "company.hide" : "company.unhide",
    target: { type: "company", id: companyId },
    reason,
    before: { staffHiddenAt: before.staff_hidden_at ?? null },
    run: async () => {
      const { error } = await admin
        .from("companies")
        .update({ staff_hidden_at: at })
        .eq("id", companyId);
      if (error) throw new Error(error.message);
      return { result: true, after: { staffHiddenAt: at } };
    },
  });

  if (result.ok) revalidateCompany(companyId, before.slug as string);
  return result.ok
    ? { ok: true as const }
    : { ok: false as const, error: result.error };
}

/** Hard-delete only when no confirmed partners exist. Otherwise hide. */
export async function adminRemoveCompany(formData: FormData) {
  const actor = await requirePlatformStaff("owner");
  const companyId = String(formData.get("companyId") ?? "");
  const confirmName = String(formData.get("confirmName") ?? "").trim();
  const reason = String(formData.get("reason") ?? "");
  if (!companyId) return { ok: false as const, error: "Missing company." };

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const { data: company } = await admin
    .from("companies")
    .select("id, name, slug")
    .eq("id", companyId)
    .maybeSingle();
  if (!company) return { ok: false as const, error: "Company not found." };
  if (confirmName !== company.name) {
    return { ok: false as const, error: "Typed name does not match." };
  }

  const { count } = await admin
    .from("partnerships")
    .select("id", { count: "exact", head: true })
    .or(`requester_id.eq.${companyId},recipient_id.eq.${companyId}`)
    .eq("status", "accepted");
  if ((count ?? 0) > 0) {
    return {
      ok: false as const,
      error:
        "This company has confirmed partners. Hide the public profile instead — deleting would remove the other side’s record.",
    };
  }

  const result = await runAdminAction({
    actor,
    action: "company.remove",
    target: { type: "company", id: companyId },
    reason,
    before: { id: company.id, slug: company.slug, name: company.name },
    run: async () => {
      const { error } = await admin.from("companies").delete().eq("id", companyId);
      if (error) throw new Error(error.message);
      return { result: true, after: { deleted: true } };
    },
  });

  if (result.ok) {
    revalidateCompany(companyId, company.slug as string);
    redirect("/admin/companies");
  }
  return { ok: false as const, error: result.error };
}
