import type { AnalyticsProps } from "@/features/product-analytics/properties";
import type { ProductEventName } from "@/features/product-analytics/taxonomy";

export type ProviderEvent = {
  name: ProductEventName;
  companyId: string | null;
  props: AnalyticsProps;
  once: boolean;
  createdAt: string;
};

export type AnalyticsProvider = {
  id: string;
  /** Whether this sink requires vendor (third-party) consent. */
  requiresVendorConsent: boolean;
  track: (event: ProviderEvent) => Promise<void>;
};
