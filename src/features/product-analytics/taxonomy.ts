/**
 * Product analytics event taxonomy.
 * Documented in docs/PRODUCT-ANALYTICS.md — keep names stable.
 */

export const ACQUISITION_EVENTS = [
  "landing_page_viewed",
  "signup_started",
  "signup_completed",
] as const;

export const ACTIVATION_FUNNEL_EVENTS = [
  "company_created",
  "domain_verified",
  "first_project_created",
  "first_invitation_sent",
  "first_invitation_opened",
  "first_reference_confirmed",
  "first_reference_published",
] as const;

export const ENGAGEMENT_EVENTS = [
  "project_created",
  "invitation_sent",
  "reminder_sent",
  "profile_viewed",
  "embed_created",
  "embed_installed",
  "proposal_export_created",
] as const;

export const REVENUE_EVENTS = [
  "pricing_viewed",
  "checkout_started",
  "subscription_started",
  "subscription_upgraded",
  "subscription_downgraded",
  "subscription_cancelled",
  "payment_failed",
] as const;

export const GROWTH_EVENTS = [
  "invited_company_confirmed",
  "invited_company_created_profile",
  "invited_company_sent_first_invitation",
] as const;

/** Internal / legacy — still allowed, not in funnel dashboards. */
export const INTERNAL_EVENTS = [
  "domain_verification_started",
  "first_invitation_started",
  "dashboard_cta_clicked",
] as const;

export const PRODUCT_EVENTS = [
  ...ACQUISITION_EVENTS,
  ...ACTIVATION_FUNNEL_EVENTS,
  ...ENGAGEMENT_EVENTS,
  ...REVENUE_EVENTS,
  ...GROWTH_EVENTS,
  ...INTERNAL_EVENTS,
] as const;

export type ProductEventName = (typeof PRODUCT_EVENTS)[number];

/** Emit at most once per company (DB unique + in-process guard). */
export const ONCE_PER_COMPANY_EVENTS = [
  "company_created",
  "domain_verified",
  "first_project_created",
  "first_invitation_sent",
  "first_invitation_opened",
  "first_reference_confirmed",
  "first_reference_published",
  "invited_company_confirmed",
  "invited_company_created_profile",
  "invited_company_sent_first_invitation",
  "subscription_started",
] as const satisfies readonly ProductEventName[];

export type OncePerCompanyEvent = (typeof ONCE_PER_COMPANY_EVENTS)[number];

export function isProductEventName(value: string): value is ProductEventName {
  return (PRODUCT_EVENTS as readonly string[]).includes(value);
}

export function isOncePerCompanyEvent(
  name: ProductEventName,
): name is OncePerCompanyEvent {
  return (ONCE_PER_COMPANY_EVENTS as readonly string[]).includes(name);
}
