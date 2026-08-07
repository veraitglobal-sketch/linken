"use server";

import { headers } from "next/headers";
import { track } from "@/features/product-analytics/track";
import {
  isProductEventName,
  type ProductEventName,
} from "@/features/product-analytics/taxonomy";
import { sanitizeAnalyticsProps } from "@/features/product-analytics/sanitize";
import type { AnalyticsProps } from "@/features/product-analytics/properties";
import {
  clientIpFromHeaders,
  takeRateLimit,
} from "@/features/security/rate-limit";

const PUBLIC_CLIENT_EVENTS = new Set<ProductEventName>([
  "landing_page_viewed",
  "signup_started",
  "pricing_viewed",
]);

/** Client → server bridge for allowlisted public events only. */
export async function trackClientEvent(input: {
  name: string;
  props?: AnalyticsProps;
}): Promise<void> {
  if (!isProductEventName(input.name)) return;
  if (!PUBLIC_CLIENT_EVENTS.has(input.name)) return;

  const hdrs = await headers();
  const ip = clientIpFromHeaders(hdrs);
  const limited = takeRateLimit({
    key: `analytics-beacon:${ip}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (!limited.ok) return;

  await track(
    {
      name: input.name,
      props: sanitizeAnalyticsProps(input.props),
    },
    { respectVisitorConsent: true },
  );
}
