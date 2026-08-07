import "server-only";

import { cookies } from "next/headers";
import {
  ANALYTICS_CONSENT_COOKIE,
  ANALYTICS_VENDOR_COOKIE,
  canTrackFirstParty,
  canTrackVendors,
  parseFirstPartyConsent,
  parseVendorConsent,
  type FirstPartyConsent,
  type VendorConsent,
} from "@/features/product-analytics/consent";

export async function readAnalyticsConsent(): Promise<{
  firstParty: FirstPartyConsent;
  vendors: VendorConsent;
  allowFirstParty: boolean;
  allowVendors: boolean;
}> {
  const jar = await cookies();
  const firstParty = parseFirstPartyConsent(
    jar.get(ANALYTICS_CONSENT_COOKIE)?.value,
  );
  const vendors = parseVendorConsent(jar.get(ANALYTICS_VENDOR_COOKIE)?.value);
  return {
    firstParty,
    vendors,
    allowFirstParty: canTrackFirstParty(firstParty),
    allowVendors: canTrackVendors(vendors),
  };
}
