"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSubsidiaryCore } from "@/features/groups/core";
import { ensureGroupForCompany } from "@/features/groups/ensure-group";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeAppBack, withBackQuery } from "@/lib/safe-back";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { createClient } from "@/lib/supabase/server";

const BACK = "/dashboard/add";

function revalidateGraph(slug: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/add");
  revalidatePath("/dashboard/map");
  revalidatePath("/dashboard/structure");
  revalidatePath(`/c/${slug}`);
}

async function operatorWithAdmin(back: string) {
  const { user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(withBackQuery(back, { error: "Create your company first." }));
  }
  const admin = createAdminClient();
  if (!admin) {
    redirect(withBackQuery(back, { error: "Could not open company structure." }));
  }
  return { user, company, admin };
}

export async function createOwnedBranch(formData: FormData) {
  const back = safeAppBack(String(formData.get("back") ?? BACK), BACK);
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  const { user, company, admin } = await operatorWithAdmin(back);
  const group = await ensureGroupForCompany(admin, {
    ownerUserId: user.id,
    companyId: company.id,
    companyName: company.name,
  });
  if (!group.ok) redirect(withBackQuery(back, { error: group.error }));

  const result = await createSubsidiaryCore(admin, {
    ownerUserId: user.id,
    companyId: company.id,
    name,
    category,
    city,
    country,
    website: website || null,
    parentCompanyId: company.id,
  });
  if (!result.ok) redirect(withBackQuery(back, { error: result.error }));

  revalidateGraph(result.data.slug);
  redirect(withBackQuery("/dashboard/map", { subsidiary: result.data.slug }));
}

export async function createJointCompany(formData: FormData) {
  const back = safeAppBack(String(formData.get("back") ?? `${BACK}?kind=joint`), BACK);
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const coParentId = String(formData.get("co_parent_company_id") ?? "").trim();
  const percentageRaw = String(formData.get("ownership_percentage") ?? "").trim();
  const percentage = percentageRaw ? Number(percentageRaw) : null;

  if (!coParentId) {
    redirect(withBackQuery(back, { error: "Pick the other owner." }));
  }
  if (!name || !category || !city) {
    redirect(withBackQuery(back, { error: "Name, category, and city are required." }));
  }
  if (percentage !== null && (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100)) {
    redirect(withBackQuery(back, { error: "Share must be between 0 and 100." }));
  }

  const { user, company, admin } = await operatorWithAdmin(back);
  const group = await ensureGroupForCompany(admin, {
    ownerUserId: user.id,
    companyId: company.id,
    companyName: company.name,
  });
  if (!group.ok) redirect(withBackQuery(back, { error: group.error }));

  const child = await createSubsidiaryCore(admin, {
    ownerUserId: user.id,
    companyId: company.id,
    name,
    category,
    city,
    country: "",
    parentCompanyId: company.id,
  });
  if (!child.ok) redirect(withBackQuery(back, { error: child.error }));

  const supabase = await createClient();
  const { error } = await supabase.rpc("propose_co_ownership", {
    p_group_id: group.data.groupId,
    p_child_company_id: child.data.id,
    p_co_parent_company_id: coParentId,
    p_as_company_id: child.data.id,
    p_ownership_percentage: percentage,
    p_ownership_type: "joint_venture",
  });
  if (error) {
    redirect(
      withBackQuery(back, {
        subsidiary: child.data.slug,
        error: error.message,
      }),
    );
  }

  revalidateGraph(child.data.slug);
  redirect(withBackQuery("/dashboard/add?kind=joint", { proposed: "1" }));
}
