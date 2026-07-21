"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { classifyLogoFetchFailure } from "@/features/logo/classify-failure";
import { fetchAndStoreCompanyLogo } from "@/features/logo/fetch-logo";
import { requireOperatorActiveCompany } from "@/features/workspace/require-operator";

function revalidateLogoPaths(slug: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath(`/c/${slug}/edit`);
  revalidatePath("/dashboard/verification");
  revalidatePath(`/c/${slug}`);
  revalidatePath(`/c/${slug}/one-pager`);
  revalidatePath(`/embed/${slug}`);
}

/** Silent auto-fetch for settings — no redirect (used by client). */
export async function ensureCompanyLogoFromWebsite(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const { company } = await requireOperatorActiveCompany({
    loginNext: "/dashboard/settings",
  });

  if (company.logo_source === "manual") {
    return { ok: false, error: "Manual logo is not overwritten." };
  }
  if (company.logo_source === "cleared") {
    return { ok: false, error: "Logo was removed." };
  }
  if (!company.website) {
    return { ok: false, error: "Add a company website first." };
  }

  const result = await fetchAndStoreCompanyLogo(company.id);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  revalidateLogoPaths(company.slug);
  return { ok: true };
}

export async function clearCompanyLogo(formData?: FormData) {
  const backRaw = String(formData?.get("back") ?? "").trim();
  const { supabase, company } = await requireOperatorActiveCompany({
    loginNext: backRaw.startsWith("/") ? backRaw : "/dashboard/settings",
  });
  const back =
    backRaw.startsWith(`/c/${company.slug}`) || backRaw === "/dashboard/settings"
      ? backRaw
      : `/c/${company.slug}/edit`;
  const sep = back.includes("?") ? "&" : "?";

  const { error } = await supabase
    .from("companies")
    .update({ logo_url: null, logo_source: "cleared" })
    .eq("id", company.id);

  if (error) {
    redirect(`${back}${sep}error=${encodeURIComponent(error.message)}`);
  }

  revalidateLogoPaths(company.slug);
  revalidatePath(`/c/${company.slug}/edit`);
  redirect(`${back}${sep}ok=logo-cleared`);
}

export async function refreshLogo(formData: FormData) {
  const backRaw = String(formData.get("back") ?? "/dashboard").trim();
  const back = backRaw.startsWith("/") ? backRaw : "/dashboard";

  const { supabase, company } = await requireOperatorActiveCompany({
    loginNext: back,
  });

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
    if (!result.skipped) {
      console.error(
        "[logo-fetch] company",
        company.id,
        classifyLogoFetchFailure(result.error),
        result.error,
      );
    }
    redirect(dash(`error=${encodeURIComponent(result.error)}`));
  }

  revalidateLogoPaths(company.slug);
  redirect(dash("ok=logo"));
}
