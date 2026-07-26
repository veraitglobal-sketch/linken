import "server-only";

import { getSiteUrl } from "@/lib/site";

/**
 * OAuth redirect origin must match the URI registered with Calendly/Cal.com
 * and the host users actually use. Live traffic is on www (apex → www).
 */
export function schedulingOAuthOrigin(): string {
  const site = getSiteUrl().replace(/\/$/, "");
  try {
    const host = new URL(site).hostname.toLowerCase();
    if (host === "hansala.com" || host === "www.hansala.com") {
      return "https://www.hansala.com";
    }
  } catch {
    /* fall through */
  }
  return site;
}
