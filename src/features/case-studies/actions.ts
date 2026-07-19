"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureCaseStudyRow } from "@/features/case-studies/ensure-case-study";
import { sendClientConfirmationEmail } from "@/lib/email";
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

  const supabase = await createClient();
  const { user, company } = await requireUserCompany(supabase);

  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company || company.slug !== companySlug) {
    redirect(`${back}?error=${encodeURIComponent("Only the company owner can request confirmation.")}`);
  }

  const caseStudyId = await ensureCaseStudyRow(
    supabase,
    company.id,
    companySlug,
    caseSlug,
  );

  if (!caseStudyId) {
    redirect(`${back}?error=${encodeURIComponent("Case study could not be prepared.")}`);
  }

  const { data: mockMeta } = await supabase
    .from("case_studies")
    .select("title")
    .eq("id", caseStudyId)
    .single();

  // Token is generated here and never read back — the token column is not
  // selectable through the table API (bearer credential).
  const token = crypto.randomUUID();

  const { error } = await supabase
    .from("case_study_client_confirmation_requests")
    .insert({
      case_study_id: caseStudyId,
      requested_by_company_id: company.id,
      email,
      token,
      status: "pending",
    });

  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  await sendClientConfirmationEmail({
    to: email,
    requesterName: company.name,
    caseTitle: mockMeta?.title ?? caseSlug,
    token,
  });

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
  redirect(`${path}?done=${response}`);
}
