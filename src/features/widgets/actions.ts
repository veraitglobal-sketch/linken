"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createUnclaimedPartnerCore } from "@/features/partners/core";
import { mergeLogoWallExcluded } from "@/features/widgets/settings";
import { sendClaimInviteEmail } from "@/lib/email";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { createAdminClient } from "@/lib/supabase/admin";

function safeWidgetsBack(raw: string) {
  const back = raw.trim();
  return back.startsWith("/dashboard") ? back : "/dashboard/widgets";
}

async function requireOperatorCompany() {
  return getOperatorActiveCompany();
}

/** Persist which confirmed firms are hidden from the public Logo wall. */
export async function saveLogoWallSelection(formData: FormData) {
  const back = safeWidgetsBack(String(formData.get("back") ?? "/dashboard/widgets"));
  const included = formData.getAll("included_id").map(String).filter(Boolean);
  const allIds = formData.getAll("candidate_id").map(String).filter(Boolean);

  const { supabase, user, company } = await requireOperatorCompany();
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

  const { supabase, user, company } = await requireOperatorCompany();
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

  const { supabase, user, company } = await requireOperatorCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(`${back}?error=${encodeURIComponent("Create your company first.")}`);
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
  redirect(`${back}?wallInvited=${encodeURIComponent(result.data.slug)}`);
}
