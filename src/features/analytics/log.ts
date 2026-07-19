import type { ProfileEventType, ProfileSource } from "@/features/analytics/sources";
import { createClient } from "@/lib/supabase/server";

/** Fire-and-forget privacy-first counter — never throws to the page. */
export async function logProfileEvent(
  companySlug: string,
  eventType: ProfileEventType,
  source: ProfileSource = "direct",
): Promise<void> {
  if (!companySlug) return;
  try {
    const supabase = await createClient();
    await supabase.rpc("log_profile_event", {
      p_company_slug: companySlug,
      p_event_type: eventType,
      p_source: source,
    });
  } catch {
    // Analytics must never break product flows
  }
}
