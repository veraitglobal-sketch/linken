import "server-only";

import type { AnalyticsProvider } from "@/features/product-analytics/providers/types";
import { createAdminClient } from "@/lib/supabase/admin";

/** Writes to Supabase product_events — no PII columns. */
export function createFirstPartyProvider(): AnalyticsProvider {
  return {
    id: "first_party",
    requiresVendorConsent: false,
    async track(event) {
      const admin = createAdminClient();
      if (!admin) return;

      if (event.once && event.companyId) {
        const { error } = await admin.rpc("track_product_event_once", {
          p_company_id: event.companyId,
          p_event_name: event.name,
          p_props: event.props,
        });
        if (error) {
          console.error("[product-analytics:first_party]", event.name, error.message);
        }
        return;
      }

      const { error } = await admin.from("product_events").insert({
        company_id: event.companyId,
        event_name: event.name,
        props: event.props,
      });
      if (error) {
        console.error("[product-analytics:first_party]", event.name, error.message);
      }
    },
  };
}
