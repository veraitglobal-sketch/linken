"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  hasForbiddenSettingsFields,
  parseSettingsFormData,
  websiteDomainChanged,
} from "@/features/company/profile-fields";
import { uploadLogoCore } from "@/features/logo/core";
import { matchCompanyToSearches } from "@/features/radar-leads/match";
import { requireOperatorActiveCompany } from "@/features/workspace/require-operator";
import { createAdminClient } from "@/lib/supabase/admin";

function safeBack(raw: string, slug: string) {
  const back = raw.trim();
  if (back.startsWith(`/c/${slug}`)) return back;
  if (back === "/dashboard/settings") return `/c/${slug}/edit`;
  return `/c/${slug}/edit`;
}

function backWith(back: string, params: Record<string, string>) {
  const url = new URL(back, "http://linken.local");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return `${url.pathname}${url.search}`;
}

function revalidateCompany(slug: string) {
  revalidatePath("/dashboard/settings");
  revalidatePath(`/c/${slug}/edit`);
  revalidatePath("/dashboard");
  revalidatePath(`/c/${slug}`);
  revalidatePath(`/c/${slug}/one-pager`);
  revalidatePath(`/embed/${slug}`);
}

export async function updateCompanyProfile(formData: FormData) {
  const backHint = String(formData.get("back") ?? "").trim();
  const { supabase, company } = await requireOperatorActiveCompany({
    loginNext: backHint.startsWith("/") ? backHint : "/dashboard/settings",
  });
  const back = safeBack(backHint, company.slug);

  const forbidden = hasForbiddenSettingsFields(formData);
  if (forbidden) {
    redirect(backWith(back, { error: `Field "${forbidden}" cannot be changed here.` }));
  }

  const parsed = parseSettingsFormData(formData);
  if (!parsed.ok) redirect(backWith(back, { error: parsed.error }));

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
      organization_kind: next.organization_kind,
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

  if (error) redirect(backWith(back, { error: error.message }));
  if (!updated) {
    redirect(
      backWith(back, {
        error: "Could not save profile — check you still have edit access.",
      }),
    );
  }

  if (domainShift) {
    const admin = createAdminClient();
    if (!admin) {
      redirect(backWith(back, { error: "Could not update domain verification status." }));
    }
    const { error: rpcError } = await admin.rpc("set_domain_unverified", {
      p_company_id: company.id,
    });
    if (rpcError) redirect(backWith(back, { error: rpcError.message }));
    revalidateCompany(company.slug);
    redirect("/dashboard/verification?domainChanged=1");
  }

  if (next.accepting_clients && !company.accepting_clients) {
    void matchCompanyToSearches(company.id, "accepting_clients");
  }

  revalidateCompany(company.slug);
  redirect(backWith(back, { saved: "1" }));
}

/** In-place upload — no redirect. */
export async function uploadCompanyLogo(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const { user, company } = await requireOperatorActiveCompany({
    loginNext: "/dashboard/settings",
  });
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image file." };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Upload unavailable right now." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await uploadLogoCore(admin, company.id, {
    bytes,
    contentType: file.type || "image/png",
    ownerUserId: user.id,
  });
  if (!result.ok) return { ok: false, error: result.error };

  revalidateCompany(company.slug);
  return { ok: true };
}
