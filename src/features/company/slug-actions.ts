"use server";

import { redirect } from "next/navigation";
import { isReservedCompanySlug } from "@/features/companies/reserved-slugs";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { createClient } from "@/lib/supabase/server";

export async function updateCompanySlug(formData: FormData) {
  const newSlugRaw = String(formData.get("slug") ?? "").trim().toLowerCase();
  const currentSlug = String(formData.get("current_slug") ?? "").trim();
  const back = `/c/${currentSlug}/edit`;

  if (!newSlugRaw) {
    redirect(`${back}?error=${encodeURIComponent("Enter a handle.")}`);
  }
  if (isReservedCompanySlug(newSlugRaw)) {
    redirect(
      `${back}?error=${encodeURIComponent("That handle is reserved. Choose another.")}`,
    );
  }

  const { user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(
      `${back}?error=${encodeURIComponent("Switch to a company workspace first.")}`,
    );
  }

  const supabase = await createClient();
  const { data: newSlug, error } = await supabase.rpc("update_company_slug", {
    p_company_id: company.id,
    p_new_slug: newSlugRaw,
  });

  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/c/${newSlug}/edit?slugChanged=1`);
}
