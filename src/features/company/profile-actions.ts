"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  hasForbiddenSettingsFields,
  parseSettingsFormData,
  websiteDomainChanged,
} from "@/features/company/profile-fields";
import { matchCompanyToSearches } from "@/features/radar-leads/match";
import { uploadLogoCore } from "@/features/logo/core";
import { requireOperatorActiveCompany } from "@/features/workspace/require-operator";
import { createAdminClient } from "@/lib/supabase/admin";

const SETTINGS = "/dashboard/settings";

function fail(message: string): never {
  redirect(`${SETTINGS}?error=${encodeURIComponent(message)}`);
}

async function requireOperatorCompany() {
  return requireOperatorActiveCompany({ loginNext: SETTINGS });
}

function revalidateCompany(slug: string) {
  revalidatePath(SETTINGS);
  revalidatePath("/dashboard");
  revalidatePath(`/c/${slug}`);
  revalidatePath(`/c/${slug}/one-pager`);
  revalidatePath(`/embed/${slug}`);
}

export async function updateCompanyProfile(formData: FormData) {
  const forbidden = hasForbiddenSettingsFields(formData);
  if (forbidden) fail(`Field "${forbidden}" cannot be changed here.`);

  const parsed = parseSettingsFormData(formData);
  if (!parsed.ok) fail(parsed.error);

  const { supabase, company } = await requireOperatorCompany();
  const next = parsed.data;
  const domainShift =
    Boolean(company.verified) &&
    websiteDomainChanged(company.website ?? "", next.website);

  const { data: updated, error } = await supabase
    .from("companies")
    .update({
      name: next.name,
      tagline: next.tagline,
      description: next.description,
      category: next.category,
      city: next.city,
      country: next.country,
      website: next.website,
      linkedin_url: next.linkedin_url,
      facebook_url: next.facebook_url,
      services: next.services,
      accepting_clients: next.accepting_clients,
    })
    .eq("id", company.id)
    .select("id")
    .maybeSingle();

  if (error) fail(error.message);
  if (!updated) {
    fail("Could not save profile — check you still have edit access.");
  }

  if (domainShift) {
    const admin = createAdminClient();
    if (!admin) fail("Could not update domain verification status.");
    const { error: rpcError } = await admin.rpc("set_domain_unverified", {
      p_company_id: company.id,
    });
    if (rpcError) fail(rpcError.message);
    revalidateCompany(company.slug);
    redirect("/dashboard/verification?domainChanged=1");
  }

  if (next.accepting_clients && !company.accepting_clients) {
    void matchCompanyToSearches(company.id, "accepting_clients");
  }

  revalidateCompany(company.slug);
  redirect(`${SETTINGS}?saved=1`);
}

export async function uploadCompanyLogo(formData: FormData) {
  const { user, company } = await requireOperatorCompany();
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    fail("Choose an image file to upload.");
  }

  const admin = createAdminClient();
  if (!admin) fail("Logo upload is temporarily unavailable.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await uploadLogoCore(admin, company.id, {
    bytes,
    contentType: file.type || "image/png",
    ownerUserId: user.id,
  });

  if (!result.ok) fail(result.error);

  revalidateCompany(company.slug);
  redirect(`${SETTINGS}?ok=logoUpload`);
}
