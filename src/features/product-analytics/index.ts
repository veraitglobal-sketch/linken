/**
 * Public product-analytics surface — use `track` / `trackServer`, not providers.
 */
export { track, trackServer } from "@/features/product-analytics/track";
export { trackLifecycle, trackEngagement } from "@/features/product-analytics/helpers";
export type { TrackInput, AnalyticsProps } from "@/features/product-analytics/properties";
export type { ProductEventName } from "@/features/product-analytics/taxonomy";
export {
  PRODUCT_EVENTS,
  ONCE_PER_COMPANY_EVENTS,
  isProductEventName,
  isOncePerCompanyEvent,
} from "@/features/product-analytics/taxonomy";
export { ANALYTICS_REPORTS, getAnalyticsReport } from "@/features/product-analytics/reports";
export {
  sanitizeAnalyticsProps,
  containsSensitiveAnalyticsData,
} from "@/features/product-analytics/sanitize";
export {
  parseFirstPartyConsent,
  parseVendorConsent,
  canTrackFirstParty,
  canTrackVendors,
} from "@/features/product-analytics/consent";
