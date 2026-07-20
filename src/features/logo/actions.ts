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

  const dash = (query: string) => {
    const hashIdx = back.indexOf("#");
    const path = (hashIdx >= 0 ? back.slice(0, hashIdx) : back) || "/dashboard";
    const hash = hashIdx >= 0 ? back.slice(hashIdx) : "";
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}${query}${hash}`;
  };

  if (company.logo_source === "manual") {
    redirect(
      dash(
        `error=${encodeURIComponent("Your uploaded logo is not replaced automatically.")}`,
      ),
    );
  }

  if (!company.website) {
    redirect(dash(`error=${encodeURIComponent("Add a company website first.")}`));
  }

  const { data: allowed, error: rateError } = await supabase.rpc(
    "record_logo_refresh_attempt",
    { p_company_id: company.id },
  );

  if (rateError) {
    redirect(dash(`error=${encodeURIComponent(rateError.message)}`));
  }
  if (allowed === false) {
    redirect(
      dash(
        `error=${encodeURIComponent("Rate limit: max 3 logo refreshes per day.")}`,
      ),
    );
  }

  const result = await fetchAndStoreCompanyLogo(company.id);
  if (!result.ok) {
    redirect(dash(`error=${encodeURIComponent(result.error)}`));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/verification");
  revalidatePath(`/c/${company.slug}`);
  revalidatePath(`/c/${company.slug}/one-pager`);
  revalidatePath(`/embed/${company.slug}`);
  redirect(dash("ok=logo"));
}
