"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fetchAndStoreCompanyLogo } from "@/features/logo/fetch-logo";
import { createClient } from "@/lib/supabase/server";

export async function refreshLogo(formData: FormData) {
  const backRaw = String(formData.get("back") ?? "/dashboard").trim();
  const back = backRaw.startsWith("/") ? backRaw : "/dashboard";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data: company } = await supabase
    .from("companies")
    .select("id, slug, website, logo_source")
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .maybeSingle();

  if (!company) redirect("/onboarding");

  if (company.logo_source === "manual") {
    redirect(
      `${back}?error=${encodeURIComponent("Your uploaded logo is not replaced automatically.")}`,
    );
  }

  if (!company.website) {
    redirect(
      `${back}?error=${encodeURIComponent("Add a company website first.")}`,
    );
  }

  const { data: allowed, error: rateError } = await supabase.rpc(
    "record_logo_refresh_attempt",
    { p_company_id: company.id },
  );

  if (rateError) {
    redirect(`${back}?error=${encodeURIComponent(rateError.message)}`);
  }
  if (allowed === false) {
    redirect(
      `${back}?error=${encodeURIComponent("Rate limit: max 3 logo refreshes per day.")}`,
    );
  }

  const result = await fetchAndStoreCompanyLogo(company.id);
  if (!result.ok) {
    redirect(
      `${back}?error=${encodeURIComponent(result.error)}`,
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(`/c/${company.slug}`);
  revalidatePath(`/c/${company.slug}/one-pager`);
  revalidatePath(`/embed/${company.slug}`);
  redirect(`${back}?logoRefreshed=1`);
}
