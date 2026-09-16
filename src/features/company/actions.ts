"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { matchCompanyToSearches } from "@/features/radar-leads/match";
import { requireOperatorActiveCompany } from "@/features/workspace/require-operator";

export async function setAcceptingClients(formData: FormData) {
  const accepting = String(formData.get("accepting_clients") ?? "") === "true";

  const { supabase, company } = await requireOperatorActiveCompany({
    loginNext: "/dashboard",
  });

  const { error } = await supabase
    .from("companies")
    .update({ accepting_clients: accepting })
    .eq("id", company.id);

  if (error) {
    redirect(
      `/dashboard?error=${encodeURIComponent(error.message ?? "Update failed")}`,
    );
  }

  if (accepting) {
    void matchCompanyToSearches(company.id, "accepting_clients");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/c/${company.slug}`);
  revalidatePath(`/c/${company.slug}/one-pager`);
  redirect("/dashboard");
}

/** Opt-out of appearing as a logo (vs name text) in partners' Logo wall embeds. */
export async function setAllowLogoInPartnerWidgets(formData: FormData) {
  const allow =
    String(formData.get("allow_logo_in_partner_widgets") ?? "") === "true";
  const back = String(formData.get("back") ?? "/dashboard/widgets").trim();
  const safeBack = back.startsWith("/dashboard") ? back : "/dashboard/widgets";

  const { supabase, company } = await requireOperatorActiveCompany({
    loginNext: safeBack,
  });

  const { error } = await supabase
    .from("companies")
    .update({ allow_logo_in_partner_widgets: allow })
    .eq("id", company.id);

  if (error) {
    redirect(
      `${safeBack}?error=${encodeURIComponent(error.message ?? "Update failed")}`,
    );
  }

  revalidatePath(safeBack);
  revalidatePath(`/c/${company.slug}`);
  redirect(`${safeBack}?logoOpt=${allow ? "on" : "off"}`);
}
