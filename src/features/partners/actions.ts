"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createUnclaimedPartnerCore } from "@/features/partners/core";
import { sendClaimInviteEmail } from "@/lib/email";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function createUnclaimedPartner(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const inviteEmail = String(formData.get("invite_email") ?? "")
    .trim()
    .toLowerCase();
  const back = "/dashboard/partners";

  const { supabase, user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(`${back}?error=${encodeURIComponent("Create your company profile first.")}`);
  }

  const result = await createUnclaimedPartnerCore(supabase, {
    companyId: company.id,
    companyName: company.name,
    companyVerified: Boolean(company.verified),
    name,
    category,
    city,
    website,
    email: inviteEmail || null,
  });

  if (!result.ok) {
    redirect(`${back}?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath(back);
  revalidatePath(`/c/${result.data.slug}`);
  redirect(`${back}?created=${encodeURIComponent(result.data.slug)}`);
}

export async function claimCompanyProfile(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const path = `/claim/${token}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(path);

  const { data, error } = await supabase.rpc("claim_company", {
    p_token: token,
  });

  if (error) {
    redirect(`${path}?error=${encodeURIComponent(error.message)}`);
  }

  const slug = data?.slug as string | undefined;
  revalidatePath("/dashboard");
  revalidatePath("/welcome");
  if (slug) revalidatePath(`/c/${slug}`);
  // Activation: claim invitees land on a short setup path, not an empty graph
  redirect(slug ? "/welcome?from=claim" : "/dashboard");
}

/** Resend claim email without exposing claim_token in the browser. */
export async function requestClaimInviteResend(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const back = `/c/${slug}`;

  if (!slug || !email.includes("@")) {
    redirect(`${back}?claimError=${encodeURIComponent("Enter the invite email.")}`);
  }

  // resolve_claim_token is service-role only: if any browser-facing client
  // could call it, knowing the invite email would be enough to obtain the
  // claim token and hijack the profile.
  const admin = createAdminClient();
  if (!admin) {
    console.warn(
      "SUPABASE_SERVICE_ROLE_KEY not configured — claim invite resend disabled.",
    );
    redirect(`${back}?claimSent=1`);
  }

  const { data: token, error } = await admin.rpc("resolve_claim_token", {
    p_slug: slug,
    p_email: email,
  });

  if (error || !token) {
    // Same message either way — do not leak whether the email matches
    redirect(`${back}?claimSent=1`);
  }

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("name, created_by_company_id")
    .eq("slug", slug)
    .eq("claimed", false)
    .maybeSingle();

  let inviterName = "A company on Linken";
  if (company?.created_by_company_id) {
    const { data: inviter } = await supabase
      .from("companies")
      .select("name")
      .eq("id", company.created_by_company_id)
      .maybeSingle();
    if (inviter?.name) inviterName = inviter.name;
  }

  await sendClaimInviteEmail({
    to: email,
    inviterName,
    companyName: company?.name ?? slug,
    claimToken: token as string,
  });

  redirect(`${back}?claimSent=1`);
}
