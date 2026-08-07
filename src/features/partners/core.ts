import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { scheduleCompanyLogoFetch } from "@/features/logo/schedule";
import { assertInviteEmailDailyQuota } from "@/features/growth/invite-quota";
import { parseInviteSource } from "@/features/growth/referral";
import { assertGhostDailyQuota } from "@/features/partners/ghost-quota";
import { uniqueCompanySlug } from "@/features/partners/unique-slug";
import { sendClaimInviteEmail } from "@/lib/email";
import { trackEngagement } from "@/features/product-analytics/helpers";

export type CoreFail = { ok: false; error: string };
export type CoreOk<T> = { ok: true; data: T };
export type CoreResult<T> = CoreOk<T> | CoreFail;

export type CreateUnclaimedPartnerInput = {
  companyId: string;
  companyName: string;
  /** Domain verification required before inviting partners. */
  companyVerified: boolean;
  name: string;
  category: string;
  city: string;
  website?: string | null;
  email?: string | null;
  /**
   * When true and email is set, send the claim invite.
   * Default false — never auto-email without an explicit action.
   */
  sendInvite?: boolean;
  /** Analytics source — never PII. */
  inviteSource?: string;
};

/**
 * Create an unclaimed partner profile + pending partnership.
 * Never auto-accepts — confirmation stays human-only.
 */
export async function createUnclaimedPartnerCore(
  supabase: SupabaseClient,
  input: CreateUnclaimedPartnerInput,
): Promise<CoreResult<{ id: string; slug: string; name: string }>> {
  const name = input.name.trim();
  const category = input.category.trim();
  const city = input.city.trim();
  const website = (input.website ?? "").trim();
  const inviteEmail = (input.email ?? "").trim().toLowerCase() || null;

  if (!name || !category || !city) {
    return {
      ok: false,
      error: "Name, category, and city are required.",
    };
  }
  if (!input.companyVerified) {
    return {
      ok: false,
      error: "Verify your domain first, then invite partners.",
    };
  }

  const quota = await assertGhostDailyQuota(supabase, input.companyId);
  if (!quota.ok) return { ok: false, error: quota.error };

  const shouldSend = Boolean(input.sendInvite && inviteEmail);
  if (shouldSend) {
    const emailQuota = await assertInviteEmailDailyQuota(
      supabase,
      input.companyId,
    );
    if (!emailQuota.ok) return { ok: false, error: emailQuota.error };
  }

  const slug = await uniqueCompanySlug(supabase, name);
  const claimToken = crypto.randomUUID();

  const { data: ghost, error: insertError } = await supabase
    .from("companies")
    .insert({
      owner_id: null,
      claimed: false,
      claim_token: claimToken,
      created_by_company_id: input.companyId,
      invite_email: inviteEmail,
      name,
      slug,
      category,
      city,
      website,
      tagline: `${category} company · ${city}`,
      description: `Draft profile created when ${input.companyName} listed this firm as a partner.`,
      services: [],
      verified: false,
    })
    .select("id, slug, name")
    .single();

  if (insertError || !ghost) {
    return {
      ok: false,
      error: insertError?.message ?? "Could not create draft profile.",
    };
  }

  const { error: partnershipError } = await supabase.from("partnerships").insert({
    requester_id: input.companyId,
    recipient_id: ghost.id,
    status: "pending",
  });

  if (partnershipError) {
    return { ok: false, error: partnershipError.message };
  }

  if (shouldSend && inviteEmail) {
    const sent = await sendClaimInviteEmail({
      to: inviteEmail,
      inviterName: input.companyName,
      companyName: ghost.name as string,
      claimToken,
    });
    if (!sent.ok) {
      return {
        ok: false,
        error: sent.error ?? "Partner created, but invite email failed.",
      };
    }
    void trackEngagement("invitation_sent", input.companyId, {
      invite_kind: "partnership",
      surface: "email",
      source: parseInviteSource(input.inviteSource),
    });
  }

  if (website) {
    scheduleCompanyLogoFetch(ghost.id as string);
  }

  return {
    ok: true,
    data: {
      id: ghost.id as string,
      slug: ghost.slug as string,
      name: ghost.name as string,
    },
  };
}
