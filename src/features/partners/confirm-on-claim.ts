import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Claiming a draft confirms pending invites — except when the claimer already
 * owns the requester (same account invited itself). Those links are cancelled;
 * the firm stays under Your companies, not Official partners.
 */
export async function confirmPartnershipsAfterClaim(
  supabase: SupabaseClient,
  companyId: string,
  claimerUserId: string,
): Promise<void> {
  const { data: pending } = await supabase
    .from("partnerships")
    .select("id, requester_id, recipient_id")
    .eq("recipient_id", companyId)
    .eq("status", "pending");

  if (!pending?.length) return;

  const requesterIds = [
    ...new Set(pending.map((p) => p.requester_id as string)),
  ];
  const { data: requesters } = await supabase
    .from("companies")
    .select("id, owner_id")
    .in("id", requesterIds);

  const ownerById = new Map(
    (requesters ?? []).map((r) => [r.id as string, r.owner_id as string | null]),
  );

  const accept: typeof pending = [];
  const cancel: typeof pending = [];
  for (const p of pending) {
    if (ownerById.get(p.requester_id as string) === claimerUserId) {
      cancel.push(p);
    } else {
      accept.push(p);
    }
  }

  const respondedAt = new Date().toISOString();
  if (cancel.length) {
    await supabase
      .from("partnerships")
      .update({ status: "cancelled", responded_at: respondedAt })
      .in(
        "id",
        cancel.map((p) => p.id),
      );
  }
  if (!accept.length) return;

  await supabase
    .from("partnerships")
    .update({ status: "accepted", responded_at: respondedAt })
    .in(
      "id",
      accept.map((p) => p.id),
    );

  const { emitWebhookEvent } = await import("@/features/webhooks/dispatch");
  const firmIds = [
    ...new Set(
      accept.flatMap((p) => [p.requester_id as string, p.recipient_id as string]),
    ),
  ];
  const { data: firms } = await supabase
    .from("companies")
    .select("id, name, slug")
    .in("id", firmIds);
  const byId = new Map(
    (firms ?? []).map((f) => [
      f.id as string,
      { name: (f.name as string) ?? "", slug: (f.slug as string) ?? "" },
    ]),
  );
  for (const p of accept) {
    const requester = byId.get(p.requester_id as string);
    const recipient = byId.get(p.recipient_id as string);
    const base = {
      partnership_id: p.id,
      requester_id: p.requester_id,
      recipient_id: p.recipient_id,
      requester_name: requester?.name ?? null,
      recipient_name: recipient?.name ?? null,
      responded_at: respondedAt,
      via: "claim",
    };
    emitWebhookEvent(
      p.recipient_id as string,
      "partnership.accepted",
      {
        ...base,
        for_company_id: p.recipient_id,
        for_company_name: recipient?.name ?? null,
        for_company_slug: recipient?.slug ?? null,
      },
      `partnership_${p.id}`,
    );
    emitWebhookEvent(
      p.requester_id as string,
      "partnership.accepted",
      {
        ...base,
        for_company_id: p.requester_id,
        for_company_name: requester?.name ?? null,
        for_company_slug: requester?.slug ?? null,
      },
      `partnership_${p.id}`,
    );
  }

  // Pending testimonial rows for each newly accepted partnership (email later via Studio/resend).
  const { ensureTestimonialAfterConfirm } = await import(
    "@/features/testimonials/post-confirm"
  );
  for (const p of accept) {
    await ensureTestimonialAfterConfirm({
      token: p.id as string,
      source: "partnership",
    });
  }
}
