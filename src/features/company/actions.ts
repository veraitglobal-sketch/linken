"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { scheduleCompanyLogoFetch } from "@/features/logo/schedule";
import { tryEmailDomainVerificationAfterOnboarding } from "@/features/verification/actions";
import { createClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/slug";

export async function setAcceptingClients(formData: FormData) {
  const accepting = String(formData.get("accepting_clients") ?? "") === "true";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/dashboard")}`);

  const { data: company } = await supabase
    .from("companies")
    .select("id, slug")
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .maybeSingle();

  if (!company) redirect("/onboarding");

  const { error } = await supabase
    .from("companies")
    .update({ accepting_clients: accepting })
    .eq("id", company.id);

  if (error) {
    redirect(
      `/dashboard?error=${encodeURIComponent(error.message ?? "Update failed")}`,
    );
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(safeBack)}`);

  const { data: company } = await supabase
    .from("companies")
    .select("id, slug")
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .maybeSingle();

  if (!company) redirect("/onboarding");

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

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slug = toSlug(name);

  if (!name || !slug) {
    redirect("/onboarding?error=Company%20name%20is%20required");
  }

  const { data: created, error } = await supabase
    .from("companies")
    .insert({
      owner_id: user.id,
      claimed: true,
      claim_token: null,
      name,
      slug,
      category,
      city,
      website,
      description,
      tagline: description.slice(0, 120),
    })
    .select("id, slug")
    .single();

  if (error || !created) {
    redirect(
      `/onboarding?error=${encodeURIComponent(error?.message ?? "Could not create company.")}`,
    );
  }

  // Automatic email-domain verification when website matches work email
  let autoVerified = false;
  if (website && user.email) {
    const result = await tryEmailDomainVerificationAfterOnboarding({
      companyId: created.id,
      website,
      ownerEmail: user.email,
      slug: created.slug,
    });
    autoVerified = result.ok;
  }

  if (website) {
    scheduleCompanyLogoFetch(created.id);
  }

  revalidatePath(`/c/${created.slug}`);
  revalidatePath("/dashboard");

  // Mid-step when auto-verify did not pass — non-blocking “Do it later” on that page
  if (!autoVerified) {
    redirect("/onboarding/verify");
  }

  redirect(`/c/${created.slug}?domainVerified=1`);
}
