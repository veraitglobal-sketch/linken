"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { confirmPartnershipsAfterClaim } from "@/features/partners/confirm-on-claim";
import { createUnclaimedPartnerCore } from "@/features/partners/core";
import { sendClaimInviteEmail } from "@/lib/email";
import { safeAppBack, withBackQuery } from "@/lib/safe-back";
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
  const sendInvite = String(formData.get("send_invite") ?? "") === "1";
  const inviteSource = String(formData.get("invite_source") ?? "dashboard");
  const back = safeAppBack(
    String(formData.get("back") ?? "/dashboard/partners"),
    "/dashboard/partners",
  );

  const { supabase, user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(
      withBackQuery(back, { error: "Create your company profile first." }),
    );
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
    sendInvite,
    inviteSource,
  });

  if (!result.ok) {
    redirect(withBackQuery(back, { error: result.error }));
  }

  revalidatePath(back.split("?")[0]?.split("#")[0] || "/dashboard/partners");
  revalidatePath(`/c/${result.data.slug}`);
  redirect(withBackQuery(back, { created: result.data.slug }));
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

  const claimed = data as { id?: string; slug?: string } | null;
  const companyId = claimed?.id;
  const slug = claimed?.slug;

  if (companyId) {
    await confirmPartnershipsAfterClaim(supabase, companyId, user.id);
    const { trackLifecycle } = await import(
      "@/features/product-analytics/helpers"
    );
    void trackLifecycle("invited_company_created_profile", companyId, {
      invite_kind: "claim",
      surface: "web",
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/welcome");
  if (slug) {
    revalidatePath(`/c/${slug}`);
    revalidatePath("/dashboard/partners");
  }
  redirect(slug ? `/c/${slug}?partnerConfirmed=1` : "/dashboard");
}

/** Resend claim email without exposing claim_token in the browser. */
export async function requestClaimInviteResend(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const back = `/c/${slug}`;

  if (!slug || !email.includes("@")) {
    redirect(`${back}?claimError=${encodeURIComponent("Enter the invite email.")}`);
  }

  const { headers } = await import("next/headers");
  const { clientIpFromHeaders, takeRateLimit } = await import(
    "@/features/security/rate-limit"
  );
  const hdrs = await headers();
  const ip = clientIpFromHeaders(hdrs);
  const limited = takeRateLimit({
    key: `claim-resend:${ip}:${slug}:${email}`,
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    redirect(`${back}?claimSent=1`);
  }

  // resolve_claim_token is service-role only: if any browser-facing client
  // could call it, knowing the invite email would be enough to obtain the
  // claim token and hijack the profile.
  const admin = createAdminClient();
  if (!admin) {
    redirect(
      `${back}?claimError=${encodeURIComponent("Claim email is temporarily unavailable. Try again later.")}`,
    );
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

  let inviterName = "A company on Hansala";
  if (company?.created_by_company_id) {
    const { data: inviter } = await supabase
      .from("companies")
      .select("name")
      .eq("id", company.created_by_company_id)
      .maybeSingle();
    if (inviter?.name) inviterName = inviter.name;
  }

  const sent = await sendClaimInviteEmail({
    to: email,
    inviterName,
    companyName: company?.name ?? slug,
    claimToken: token as string,
  });
  if (!sent.ok) {
    redirect(
      `${back}?claimError=${encodeURIComponent(sent.error ?? "Could not send claim email.")}`,
    );
  }

  if (company?.created_by_company_id) {
    const { logActivationEvent } = await import("@/features/activation/events");
    void logActivationEvent(
      company.created_by_company_id as string,
      "first_invitation_sent",
    );
  }

  redirect(`${back}?claimSent=1`);
}
