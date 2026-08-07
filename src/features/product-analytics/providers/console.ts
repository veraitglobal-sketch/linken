import type { AnalyticsProvider } from "@/features/product-analytics/providers/types";

/** Dev / debug sink — never enable in production unless explicitly requested. */
export function createConsoleProvider(): AnalyticsProvider {
  return {
    id: "console",
    requiresVendorConsent: false,
    async track(event) {
      if (process.env.NODE_ENV === "production") return;
      console.info("[product-analytics]", event.name, {
        companyId: event.companyId,
        props: event.props,
        once: event.once,
      });
    },
  };
}
