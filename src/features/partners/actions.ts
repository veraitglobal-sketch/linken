"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uniqueCompanySlug } from "@/features/partners/unique-slug";
import { sendClaimInviteEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

async function requireOwnedCompany() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, company: null };

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .maybeSingle();

  return { supabase, user, company };
}

export async function createUnclaimedPartner(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const inviteEmail = String(formData.get("invite_email") ?? "")
    .trim()
    .toLowerCase();
  const back = "/dashboard/partners";

  if (!name || !category || !city) {
    redirect(`${back}?error=${encodeURIComponent("Name, category, and city are required.")}`);
  }

  const { supabase, user, company } = await requireOwnedCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(`${back}?error=${encodeURIComponent("Create your company profile first.")}`);
  }

  const slug = await uniqueCompanySlug(supabase, name);
  const claimToken = crypto.randomUUID();

  const { data: ghost, error: insertError } = await supabase
    .from("companies")
    .insert({
      owner_id: null,
      claimed: false,
      claim_token: claimToken,
      created_by_company_id: company.id,
      invite_email: inviteEmail || null,
      name,
      slug,
      category,
      city,
      website,
      tagline: `${category} company · ${city}`,
      description: `Draft profile created when ${company.name} listed this firm as a partner.`,
      services: [],
      verified: false,
    })
    .select("id, slug, name")
    .single();

  if (insertError || !ghost) {
    redirect(
      `${back}?error=${encodeURIComponent(insertError?.message ?? "Could not create draft profile.")}`,
    );
  }

  // Always pending — never auto-accepted for ghost profiles
  const { error: partnershipError } = await supabase.from("partnerships").insert({
    requester_id: company.id,
    recipient_id: ghost.id,
    status: "pending",
  });

  if (partnershipError) {
    redirect(
      `${back}?error=${encodeURIComponent(partnershipError.message)}`,
    );
  }

  if (inviteEmail) {
    await sendClaimInviteEmail({
      to: inviteEmail,
      inviterName: company.name,
      companyName: ghost.name,
      claimToken,
    });
  }

  revalidatePath(back);
  revalidatePath(`/c/${ghost.slug}`);
  redirect(`${back}?created=${encodeURIComponent(ghost.slug)}`);
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
  if (slug) revalidatePath(`/c/${slug}`);
  redirect(slug ? `/c/${slug}?claimed=1` : "/dashboard");
}

/** Resend claim email without exposing claim_token in the browser. */
export async function requestClaimInviteResend(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const back = `/c/${slug}`;

  if (!slug || !email.includes("@")) {
    redirect(`${back}?claimError=${encodeURIComponent("Enter the invite email.")}`);
  }

  const supabase = await createClient();
  const { data: token, error } = await supabase.rpc("resolve_claim_token", {
    p_slug: slug,
    p_email: email,
  });

  if (error || !token) {
    // Same message either way — do not leak whether the email matches
    redirect(`${back}?claimSent=1`);
  }

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
