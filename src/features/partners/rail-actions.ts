"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clampPartnerRailLimit,
  parsePartnerRail,
} from "@/features/partners/partner-rail";
import { requireOperatorForCompanySlug } from "@/features/workspace/require-operator-slug";

export async function savePartnerRail(formData: FormData) {
  const slug = String(formData.get("company_slug") ?? "").trim();
  const back =
    String(formData.get("back") ?? "").trim() ||
    (slug ? `/c/${slug}` : "/dashboard");
  const safeBack = back.startsWith("/") ? back : "/dashboard";
  const limit = clampPartnerRailLimit(Number(formData.get("limit") ?? 12));
  const sortRaw = String(formData.get("sort_ids") ?? "").trim();
  const sortIds = sortRaw
    ? sortRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  if (!slug) {
    redirect(`${safeBack}?error=${encodeURIComponent("Missing company.")}`);
  }

  const { supabase, company } = await requireOperatorForCompanySlug({
    slug,
    loginNext: safeBack,
  });

  const next = {
    ...parsePartnerRail(null),
    sortIds,
    limit,
  };

  const { error } = await supabase
    .from("companies")
    .update({ partner_rail: next })
    .eq("id", company.id);

  if (error) {
    redirect(
      `${safeBack}?error=${encodeURIComponent(error.message ?? "Could not save")}`,
    );
  }

  revalidatePath(`/c/${company.slug}`);
  revalidatePath(`/c/${company.slug}/partners`);
  revalidatePath("/dashboard");
  redirect(safeBack);
}
