import "server-only";

import { trackServer } from "@/features/product-analytics/track";
import type { ProductEventName } from "@/features/product-analytics/taxonomy";

/**
 * Legacy activation funnel names — bridge into the typed product-analytics layer.
 * Prefer `track` / `trackServer` for new call sites.
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
  "dashboard_cta_clicked",
] as const;

export type ActivationEventType = (typeof ACTIVATION_EVENTS)[number];

/** Fire-and-forget — never throws into product flows. */
export async function logActivationEvent(
  companyId: string | null | undefined,
  eventType: ActivationEventType,
  detail?: string | null,
): Promise<void> {
  if (eventType !== "signup_completed" && !companyId) return;
  await trackServer({
    name: eventType as ProductEventName,
    companyId: companyId ?? null,
    props: detail
      ? { cta: detail.slice(0, 64), surface: "web" }
      : { surface: "web" },
  });
}
