"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { runAdminAction } from "@/features/admin/run-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Owner-only: hide owned companies, clear ownership, delete the Auth user.
 * Companies with confirmed partners must already be hidden (or we hide them).
 * We never hard-delete those rows.
 */
export async function adminDeleteUserAccount(formData: FormData) {
  const actor = await requirePlatformStaff("owner");
  const companyId = String(formData.get("companyId") ?? "");
  const confirmEmail = String(formData.get("confirmEmail") ?? "")
    .trim()
    .toLowerCase();
  const reason = String(formData.get("reason") ?? "");
  if (!companyId) return { ok: false as const, error: "Missing company." };

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const { data: company } = await admin
    .from("companies")
    .select("id, owner_id, name")
    .eq("id", companyId)
    .maybeSingle();
  if (!company?.owner_id) {
    return { ok: false as const, error: "This company has no login owner." };
  }

  const { data: userData, error: userErr } = await admin.auth.admin.getUserById(
    company.owner_id as string,
  );
  if (userErr || !userData.user) {
    return { ok: false as const, error: "Could not load the owner account." };
  }

  const ownerEmail = (userData.user.email ?? "").trim().toLowerCase();
  if (!ownerEmail || ownerEmail !== confirmEmail) {
    return { ok: false as const, error: "Typed email does not match the owner." };
  }

  const ownerId = company.owner_id as string;
  const { data: owned } = await admin
    .from("companies")
    .select("id, name, slug, staff_hidden_at")
    .eq("owner_id", ownerId);

  const result = await runAdminAction({
    actor,
    action: "account.delete",
    target: { type: "auth_user", id: ownerId },
    reason,
    before: {
      email: ownerEmail,
      companies: (owned ?? []).map((c) => ({
        id: c.id,
        slug: c.slug,
        hidden: Boolean(c.staff_hidden_at),
      })),
    },
    run: async () => {
      for (const row of owned ?? []) {
        await admin.from("company_members").delete().eq("company_id", row.id);
        const { error: clearErr } = await admin.rpc("admin_clear_company_owner", {
          p_company_id: row.id,
        });
        if (clearErr) {
          throw new Error(`Clear owner on ${row.slug}: ${clearErr.message}`);
        }
      }

      const { error: delErr } = await admin.auth.admin.deleteUser(ownerId);
      if (delErr) throw new Error(delErr.message);

      return {
        result: true,
        after: {
          deletedUser: ownerId,
          companiesCleared: (owned ?? []).map((c) => c.id),
        },
      };
    },
  });

  if (result.ok) {
    revalidatePath(`/admin/companies/${companyId}`);
    revalidatePath("/admin/companies");
    return { ok: true as const };
  }
  return { ok: false as const, error: result.error };
}
