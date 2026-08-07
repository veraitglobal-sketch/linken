import "server-only";

import { createConsoleProvider } from "@/features/product-analytics/providers/console";
import { createFirstPartyProvider } from "@/features/product-analytics/providers/first-party";
import type { AnalyticsProvider } from "@/features/product-analytics/providers/types";

/**
 * Resolve sinks from env — never hardcode a commercial vendor SDK.
 * Optional: PRODUCT_ANALYTICS_CONSOLE=1 for local debug logs.
 * Future vendor: implement AnalyticsProvider and gate on vendor consent.
 */
export function resolveAnalyticsProviders(): AnalyticsProvider[] {
  const providers: AnalyticsProvider[] = [createFirstPartyProvider()];

  if (process.env.PRODUCT_ANALYTICS_CONSOLE === "1") {
    providers.push(createConsoleProvider());
  }

  return providers;
}
