"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requestClientConfirmationCore } from "@/features/case-studies/core";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { createClient } from "@/lib/supabase/server";

async function requireUserCompany(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, company: null };

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug, owner_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  return { user, company };
}

export async function requestClientConfirmation(formData: FormData) {
  const companySlug = String(formData.get("companySlug") ?? "").trim();
  const caseSlug = String(formData.get("caseSlug") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const back = `/c/${companySlug}/case-studies/${caseSlug}`;

  if (!companySlug || !caseSlug || !email || !email.includes("@")) {
    redirect(`${back}?error=${encodeURIComponent("Enter a valid client email.")}`);
  }

  const { supabase, user, company } = await getOperatorActiveCompany();

  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company || company.slug !== companySlug) {
    redirect(`${back}?error=${encodeURIComponent("Not allowed for this company.")}`);
  }

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

  const supabase = await createClient();
  const { user, company } = await requireUserCompany(supabase);

  if (!user) redirect(`/confirm/${token}`);
  if (!company) {
    redirect(`${path}?error=${encodeURIComponent("Create your company profile first.")}`);
  }

  const { error } = await supabase.rpc("respond_client_confirmation", {
    p_token: token,
    p_response: response,
    p_company_id: company.id,
  });

  if (error) {
    redirect(`${path}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(path);
  revalidatePath("/welcome");
  if (response === "confirmed") {
    redirect("/welcome?from=confirm");
  }
  redirect(`${path}?done=${response}`);
}
