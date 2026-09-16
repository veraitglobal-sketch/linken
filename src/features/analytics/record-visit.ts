import "server-only";

import { headers } from "next/headers";
import { logProfileEvent } from "@/features/analytics/log";
import type { ProfileEventType, ProfileSource } from "@/features/analytics/sources";
import {
  isAnalyticsBot,
  isPrefetchRequest,
  visitorHash,
} from "@/features/analytics/visitor";
import { clientIpFromHeaders } from "@/features/security/rate-limit";

/**
 * Count a public visit once per visitor per UTC day.
 *
 * Prefetch and known crawlers are skipped. The hash is IP + UA, not stored
 * as either. Inquiries still go through logProfileEvent without a hash.
 */
export async function recordVisit(
  companySlug: string,
  eventType: ProfileEventType,
  source: ProfileSource,
): Promise<boolean> {
  if (!companySlug) return false;
  if (eventType === "inquiry") {
    await logProfileEvent(companySlug, eventType, source);
    return true;
  }

  const hdrs = await headers();
  if (isPrefetchRequest(hdrs)) return false;
  const ua = hdrs.get("user-agent") ?? "";
  if (isAnalyticsBot(ua)) return false;

  const salt = process.env.ANALYTICS_HASH_SALT ?? "hansala-profile-visit";
  const hash = visitorHash(clientIpFromHeaders(hdrs), ua, salt);
  await logProfileEvent(companySlug, eventType, source, hash);
  return true;
}
