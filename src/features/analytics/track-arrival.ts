import "server-only";

import { logProfileEvent } from "@/features/analytics/log";
import { parseProfileSource } from "@/features/analytics/sources";
import { track } from "@/features/product-analytics/track";
import type { ConfirmedRelationship } from "@/features/trust/relationship-banner";
import { recordWidgetPlacementThrottled } from "@/features/widgets/record-placement";
import { createPublicClient } from "@/lib/supabase/public";

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

  const companyId = await companyIdForSlug(input.companySlug);
  await track(
    {
      name: "profile_viewed",
      companyId,
      props: { source, surface: source === "embed" ? "embed" : "web" },
    },
    { respectVisitorConsent: true },
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

async function companyIdForSlug(slug: string): Promise<string | null> {
  if (!slug) return null;
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    return (data?.id as string | undefined) ?? null;
  } catch {
    return null;
  }
}
