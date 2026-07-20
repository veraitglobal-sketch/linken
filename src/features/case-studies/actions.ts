"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requestClientConfirmationCore } from "@/features/case-studies/core";
import { requireOwnedActiveCompany } from "@/features/workspace/require-owned";
import { requireOperatorForCompanySlug } from "@/features/workspace/require-operator-slug";
import { setWorkspacePreference } from "@/features/workspace/set-preference";

export async function requestClientConfirmation(formData: FormData) {
  const companySlug = String(formData.get("companySlug") ?? "").trim();
  const caseSlug = String(formData.get("caseSlug") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const back = `/c/${companySlug}/case-studies/${caseSlug}`;

  if (!companySlug || !caseSlug || !email || !email.includes("@")) {
    redirect(`${back}?error=${encodeURIComponent("Enter a valid client email.")}`);
  }

  const { supabase, company } = await requireOperatorForCompanySlug({
    slug: companySlug,
    loginNext: back,
  });
  await setWorkspacePreference("company", company.id);

  const result = await requestClientConfirmationCore(supabase, {
    companyId: company.id,
    companyName: company.name,
    companySlug: company.slug,
    caseStudySlug: caseSlug,
    email,
  });

  if (!result.ok) {
    redirect(`${back}?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath(back);
  redirect(`${back}?requested=1`);
}

export async function confirmClientRequest(formData: FormData) {
  await respondClientRequest(formData, "confirmed");
}

export async function declineClientRequest(formData: FormData) {
  await respondClientRequest(formData, "declined");
}

async function respondClientRequest(
  formData: FormData,
  response: "confirmed" | "declined",
) {
  const token = String(formData.get("token") ?? "").trim();
  const path = `/confirm/${token}`;

  const { supabase, company } = await requireOwnedActiveCompany({
    loginNext: path,
  });

  const { error } = await supabase.rpc("respond_client_confirmation", {
    p_token: token,
    p_response: response,
    p_company_id: company.id,
  });

  if (error) {
    redirect(`${path}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(path);
  revalidatePath(`/c/${company.slug}`);
  revalidatePath("/welcome");
  // Stay on confirm page so assessment + badge refresh work (same as references).
  redirect(`${path}?done=${response}`);
}
