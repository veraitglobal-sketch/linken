"use server";

import { redirect } from "next/navigation";
import { resolveSubmitProvenance } from "@/features/testimonials/provenance-submit";
import { getTestimonialByToken } from "@/features/testimonials/token-queries";
import { createClient } from "@/lib/supabase/server";

export async function submitTestimonialForm(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const authorName = String(formData.get("author_name") ?? "").trim();
  const authorRole = String(formData.get("author_role") ?? "").trim();
  const consent = formData.get("consent_public") === "on";
  const authorCompanyId =
    String(formData.get("author_company_id") ?? "").trim() || null;

  if (!token) {
    redirect("/?error=testimonial");
  }

  const view = await getTestimonialByToken(token);
  if (!view) {
    redirect("/?error=testimonial");
  }

  // App-layer provenance is advisory UX only — RPC recomputes and ignores
  // client-supplied verified / free-provider / claimed flags.
  const provenance = await resolveSubmitProvenance({
    authorCompanyId: authorCompanyId ?? view.authorCompanyId,
    storedAuthorEmail: view.authorEmail,
  });

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_testimonial", {
    p_token: token,
    p_body: body,
    p_author_name: authorName,
    p_author_role: authorRole,
    p_consent_public: consent,
    p_author_company_id: authorCompanyId,
    p_author_email: provenance.email,
    p_author_domain: provenance.authorDomain,
    p_author_domain_verified: provenance.authorDomainVerified,
    p_author_is_free_provider: provenance.authorIsFreeProvider,
    p_author_company_claimed: provenance.authorCompanyClaimed,
  });

  if (error) {
    redirect(`/testimonial/${token}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/testimonial/${token}?done=published`);
}

export async function withdrawTestimonialForm(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) redirect("/");

  const supabase = await createClient();
  const { error } = await supabase.rpc("withdraw_testimonial", {
    p_token: token,
  });
  if (error) {
    redirect(`/testimonial/${token}?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/testimonial/${token}?done=withdrawn`);
}
