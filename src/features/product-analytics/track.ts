import "server-only";

import { readAnalyticsConsent } from "@/features/product-analytics/consent-server";
import type { TrackInput } from "@/features/product-analytics/properties";
import { resolveAnalyticsProviders } from "@/features/product-analytics/providers/resolve";
import { sanitizeAnalyticsProps } from "@/features/product-analytics/sanitize";
import {
  isOncePerCompanyEvent,
  isProductEventName,
} from "@/features/product-analytics/taxonomy";

export type TrackOptions = {
  /**
   * Visitor-facing events honor the analytics opt-out cookie.
   * Company lifecycle / webhooks set false (contract + legitimate interest).
   */
  respectVisitorConsent?: boolean;
};

/**
 * Single typed analytics interface — call this instead of provider SDKs.
 * Fire-and-forget; never throws into product flows.
 */
export async function track(
  input: TrackInput,
  options: TrackOptions = {},
): Promise<void> {
  try {
    if (!isProductEventName(input.name)) return;

    const respectVisitor = options.respectVisitorConsent !== false;
    let allowFirstParty = true;
    let allowVendors = false;

    if (respectVisitor) {
      const consent = await readAnalyticsConsent();
      allowFirstParty = consent.allowFirstParty;
      allowVendors = consent.allowVendors;
      if (!allowFirstParty) return;
    }

    const props = sanitizeAnalyticsProps(input.props);
    const companyId = input.companyId?.trim() || null;
    const once = Boolean(companyId && isOncePerCompanyEvent(input.name));
    if (once && !companyId) return;

    const event = {
      name: input.name,
      companyId,
      props,
      once,
      createdAt: new Date().toISOString(),
    };

    const providers = resolveAnalyticsProviders().filter((p) => {
      if (p.requiresVendorConsent) return allowVendors;
      return allowFirstParty || !respectVisitor;
    });

    await Promise.all(providers.map((p) => p.track(event)));
  } catch (err) {
    console.error("[product-analytics:track]", input.name, err);
  }
}

/** Server lifecycle events (billing, confirmations, activation). */
export function trackServer(input: TrackInput): Promise<void> {
  return track(input, { respectVisitorConsent: false });
}
