import "server-only";

import { emitWebhookEvent } from "@/features/webhooks/dispatch";
import { extractDomain } from "@/features/verification/domain";
import { createAdminClient } from "@/lib/supabase/admin";

type EmitInput = {
  partnershipId: string;
  requesterId: string;
  recipientId: string;
  requesterName: string;
  recipientName: string;
  recipientSlug: string;
};

/** Load requester firm + owner contact for Slack/webhook payloads. */
async function requesterExtras(requesterId: string) {
  const admin = createAdminClient();
  if (!admin) return {};

  const { data: firm } = await admin
    .from("companies")
    .select("name, slug, website, city, country, owner_id, verified")
    .eq("id", requesterId)
    .maybeSingle();

  if (!firm) return {};

  const website = ((firm.website as string) ?? "").trim();
  const domain = website ? extractDomain(website) : null;
  const extras: Record<string, unknown> = {
    requester_name: (firm.name as string) || null,
    requester_slug: (firm.slug as string) || null,
    requester_website: website || null,
    requester_domain: domain,
    requester_city: (firm.city as string) || null,
    requester_country: (firm.country as string) || null,
    requester_verified: Boolean(firm.verified),
  };

  const ownerId = firm.owner_id as string | null;
  if (!ownerId) return extras;

  try {
    const { data: ownerData } = await admin.auth.admin.getUserById(ownerId);
    const user = ownerData.user;
    if (!user) return extras;
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const contactName =
      (typeof meta.full_name === "string" && meta.full_name.trim()) ||
      (typeof meta.name === "string" && meta.name.trim()) ||
      "";
    extras.requester_contact_name = contactName || null;
    extras.requester_contact_email = user.email?.trim() || null;
  } catch {
    /* ignore auth lookup failures */
  }

  return extras;
}

/** Notify recipient company (webhooks + Slack) of a pending partnership. */
export async function emitPartnershipRequested(input: EmitInput) {
  const extras = await requesterExtras(input.requesterId);
  emitWebhookEvent(
    input.recipientId,
    "partnership.requested",
    {
      partnership_id: input.partnershipId,
      requester_id: input.requesterId,
      recipient_id: input.recipientId,
      requester_name: input.requesterName,
      recipient_name: input.recipientName,
      for_company_id: input.recipientId,
      for_company_name: input.recipientName,
      for_company_slug: input.recipientSlug,
      ...extras,
    },
    `partnership_req_${input.partnershipId}`,
  );
}
