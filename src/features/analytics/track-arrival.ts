import "server-only";

import { logProfileEvent } from "@/features/analytics/log";
import { parseProfileSource } from "@/features/analytics/sources";
import type { ConfirmedRelationship } from "@/features/trust/relationship-banner";
import { recordWidgetPlacementThrottled } from "@/features/widgets/record-placement";

/** Profile visit + optional via host attribution to the widget owner. */
export async function trackProfileArrival(input: {
  companySlug: string;
  src?: string;
  via?: string;
  relationship: ConfirmedRelationship | null;
}): Promise<void> {
  const source = parseProfileSource(input.src);
  await logProfileEvent(
    input.companySlug,
    source === "qr" ? "qr_scan" : "profile_view",
    source,
  );
  const viaHost = (input.via ?? "").trim().toLowerCase().slice(0, 253);
  if (viaHost && input.relationship) {
    await recordWidgetPlacementThrottled({
      companyId: input.relationship.other.id,
      host: viaHost,
      variant: "logo-wall",
    });
  }
}
