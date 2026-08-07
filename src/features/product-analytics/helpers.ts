import "server-only";

import { trackServer } from "@/features/product-analytics/track";
import type { AnalyticsProps } from "@/features/product-analytics/properties";
import type { ProductEventName } from "@/features/product-analytics/taxonomy";

/** Thin helpers so call sites stay readable and avoid provider imports. */

export function trackLifecycle(
  name: ProductEventName,
  companyId: string | null | undefined,
  props?: AnalyticsProps,
) {
  return trackServer({
    name,
    companyId: companyId ?? null,
    props,
  });
}

export function trackEngagement(
  name: Extract<
    ProductEventName,
    | "project_created"
    | "invitation_sent"
    | "reminder_sent"
    | "profile_viewed"
    | "embed_created"
    | "embed_installed"
    | "proposal_export_created"
  >,
  companyId: string | null | undefined,
  props?: AnalyticsProps,
) {
  return trackServer({ name, companyId: companyId ?? null, props });
}
