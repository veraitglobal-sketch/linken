"use server";

import { cookies } from "next/headers";
import {
  ANALYTICS_CONSENT_COOKIE,
  ANALYTICS_VENDOR_COOKIE,
  firstPartyConsentCookieValue,
  vendorConsentCookieValue,
  type FirstPartyConsent,
  type VendorConsent,
} from "@/features/product-analytics/consent";

const MAX_AGE = 60 * 60 * 24 * 365;

export async function setAnalyticsConsent(formData: FormData) {
  const first = String(formData.get("first_party") ?? "allow") as FirstPartyConsent;
  const vendors = String(formData.get("vendors") ?? "deny") as VendorConsent;
  const jar = await cookies();

  jar.set(ANALYTICS_CONSENT_COOKIE, firstPartyConsentCookieValue(first), {
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  jar.set(ANALYTICS_VENDOR_COOKIE, vendorConsentCookieValue(vendors), {
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
