import "server-only";

import { emitWebhookEvent } from "@/features/webhooks/dispatch";

/** Notify recipient company (webhooks + Slack) of a pending partnership. */
export function emitPartnershipRequested(input: {
  partnershipId: string;
  requesterId: string;
  recipientId: string;
  requesterName: string;
  recipientName: string;
  recipientSlug: string;
}) {
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
    },
    `partnership_req_${input.partnershipId}`,
  );
}
