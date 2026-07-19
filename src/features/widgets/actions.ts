"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { scheduleCompanyLogoFetch } from "@/features/logo/schedule";
import { assertGhostDailyQuota } from "@/features/partners/ghost-quota";
import { uniqueCompanySlug } from "@/features/partners/unique-slug";
import { mergeLogoWallExcluded } from "@/features/widgets/settings";
import { sendClaimInviteEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function safeWidgetsBack(raw: string) {
  const back = raw.trim();
  return back.startsWith("/dashboard") ? back : "/dashboard/widgets";
}

async function requireOwnedCompany() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, company: null };

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug, verified, widget_settings")
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .maybeSingle();

  return { supabase, user, company };
}

/** Persist which confirmed firms are hidden from the public Logo wall. */
export async function saveLogoWallSelection(formData: FormData) {
  const back = safeWidgetsBack(String(formData.get("back") ?? "/dashboard/widgets"));
  const included = formData.getAll("included_id").map(String).filter(Boolean);
  const allIds = formData.getAll("candidate_id").map(String).filter(Boolean);

  const { supabase, user, company } = await requireOwnedCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(`${back}?error=${encodeURIComponent("Create your company first.")}`);
  }

  const includedSet = new Set(included);
  const excludedCompanyIds = allIds.filter((id) => !includedSet.has(id));
  const next = mergeLogoWallExcluded(
    company.widget_settings,
    excludedCompanyIds,
  );

  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);

  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(back);
  revalidatePath(`/embed/${company.slug}`);
  redirect(`${back}?wallSaved=1`);
}

/** Resend claim invite for a pending ghost partner (owner-only). */
export async function resendLogoWallInvite(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "").trim();
  const back = safeWidgetsBack(String(formData.get("back") ?? "/dashboard/widgets"));

  const { supabase, user, company } = await requireOwnedCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(`${back}?error=${encodeURIComponent("Create your company first.")}`);
  }

  const { data: partnership } = await supabase
    .from("partnerships")
    .select("id, recipient_id, status")
    .eq("requester_id", company.id)
    .eq("recipient_id", companyId)
    .eq("status", "pending")
    .maybeSingle();

  if (!partnership) {
    redirect(`${back}?error=${encodeURIComponent("Pending invite not found.")}`);
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect(
      `${back}?error=${encodeURIComponent("Resend needs SUPABASE_SERVICE_ROLE_KEY.")}`,
    );
  }

  const { data: ghost } = await admin
    .from("companies")
    .select("id, name, invite_email, claim_token, claimed")
    .eq("id", companyId)
    .maybeSingle();

  if (!ghost || ghost.claimed !== false || !ghost.claim_token) {
    redirect(
      `${back}?error=${encodeURIComponent("Invite link is no longer available.")}`,
    );
  }
  if (!ghost.invite_email) {
    redirect(
      `${back}?error=${encodeURIComponent("No invite email on this draft — add one on Partners.")}`,
    );
  }

  await sendClaimInviteEmail({
    to: ghost.invite_email as string,
    inviterName: company.name,
    companyName: ghost.name as string,
    claimToken: ghost.claim_token as string,
  });

  revalidatePath(back);
  redirect(`${back}?resent=1`);
}

/** Ghost + pending partnership from Widget studio (same rules as Partners). */
export async function createUnclaimedPartnerFromWidgets(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || "Company";
  const city = String(formData.get("city") ?? "").trim() || "—";
  const website = String(formData.get("website") ?? "").trim();
  const inviteEmail = String(formData.get("invite_email") ?? "")
    .trim()
    .toLowerCase();
  const back = safeWidgetsBack(
    String(formData.get("back") ?? "/dashboard/widgets"),
  );

  if (!name) {
    redirect(`${back}?error=${encodeURIComponent("Company name is required.")}`);
  }

  const { supabase, user, company } = await requireOwnedCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(`${back}?error=${encodeURIComponent("Create your company first.")}`);
  }
  if (!company.verified) {
    redirect(
      `${back}?error=${encodeURIComponent("Verify your domain first, then invite partners.")}`,
    );
  }

  const quota = await assertGhostDailyQuota(supabase, company.id);
  if (!quota.ok) {
    redirect(`${back}?error=${encodeURIComponent(quota.error)}`);
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
      `${back}?error=${encodeURIComponent(insertError?.message ?? "Could not create draft.")}`,
    );
  }

  const { error: partnershipError } = await supabase.from("partnerships").insert({
    requester_id: company.id,
    recipient_id: ghost.id,
    status: "pending",
  });

  if (partnershipError) {
    redirect(`${back}?error=${encodeURIComponent(partnershipError.message)}`);
  }

  if (inviteEmail) {
    await sendClaimInviteEmail({
      to: inviteEmail,
      inviterName: company.name,
      companyName: ghost.name,
      claimToken,
    });
  }

  if (website) {
    scheduleCompanyLogoFetch(ghost.id);
  }

  revalidatePath(back);
  revalidatePath(`/c/${ghost.slug}`);
  redirect(`${back}?wallInvited=${encodeURIComponent(ghost.slug)}`);
}
