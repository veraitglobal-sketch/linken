/**
 * Analytics consent.
 * First-party product analytics defaults ON (legitimate interest — see Privacy).
 * Visitors can opt out via cookie. Third-party sinks require explicit opt-in.
 */

export const ANALYTICS_CONSENT_COOKIE = "hansala_analytics";
export const ANALYTICS_VENDOR_COOKIE = "hansala_analytics_vendors";

export type FirstPartyConsent = "allow" | "deny";
export type VendorConsent = "allow" | "deny";

export function parseFirstPartyConsent(
  raw: string | undefined | null,
): FirstPartyConsent {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "0" || v === "deny" || v === "false") return "deny";
  return "allow";
}

export function parseVendorConsent(
  raw: string | undefined | null,
): VendorConsent {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "1" || v === "allow" || v === "true") return "allow";
  return "deny";
}

export function canTrackFirstParty(
  consent: FirstPartyConsent = "allow",
): boolean {
  return consent === "allow";
}

export function canTrackVendors(consent: VendorConsent = "deny"): boolean {
  return consent === "allow";
}

export function firstPartyConsentCookieValue(
  consent: FirstPartyConsent,
): string {
  return consent === "deny" ? "0" : "1";
}

export function vendorConsentCookieValue(consent: VendorConsent): string {
  return consent === "allow" ? "1" : "0";
}
