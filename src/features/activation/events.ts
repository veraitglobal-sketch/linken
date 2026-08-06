import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Product activation funnel — company_id + event only.
 * Never send emails, names, or other PII.
 */
export const ACTIVATION_EVENTS = [
  "signup_completed",
  "company_created",
  "domain_verification_started",
  "domain_verified",
  "first_project_created",
  "first_invitation_started",
  "first_invitation_sent",
  "first_invitation_opened",
  "first_reference_confirmed",
  "first_reference_published",
] as const;

export type ActivationEventType = (typeof ACTIVATION_EVENTS)[number];

/** Fire-and-forget — never throws into product flows. */
export async function logActivationEvent(
  companyId: string | null | undefined,
  eventType: ActivationEventType,
): Promise<void> {
  if (eventType !== "signup_completed" && !companyId) return;
  try {
    const admin = createAdminClient();
    if (!admin) return;
    await admin.from("activation_events").insert({
      company_id: companyId ?? null,
      event_type: eventType,
    });
  } catch (err) {
    console.error("[logActivationEvent]", eventType, err);
  }
}
