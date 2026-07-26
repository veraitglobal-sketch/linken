import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * In-process throttle: at most one DB write per company+host+variant per hour.
 * Tradeoff: each serverless isolate has its own Map, so a busy fleet can still
 * write once per isolate/hour — far cheaper than one write per pageview, and
 * no shared Redis required on hobby.
 */
const lastWriteMs = new Map<string, number>();
const THROTTLE_MS = 60 * 60 * 1000;

export async function recordWidgetPlacementThrottled(input: {
  companyId: string;
  host: string;
  variant: string;
}): Promise<void> {
  const host = input.host.trim().toLowerCase();
  const variant = input.variant.trim().toLowerCase();
  if (!input.companyId || !host || !variant) return;

  const key = `${input.companyId}:${host}:${variant}`;
  const now = Date.now();
  const prev = lastWriteMs.get(key) ?? 0;
  if (now - prev < THROTTLE_MS) return;
  lastWriteMs.set(key, now);

  // Bound map growth in long-lived isolates
  if (lastWriteMs.size > 5000) {
    const cutoff = now - THROTTLE_MS;
    for (const [k, t] of lastWriteMs) {
      if (t < cutoff) lastWriteMs.delete(k);
    }
  }

  const admin = createAdminClient();
  if (!admin) return;

  try {
    await admin.rpc("record_widget_placement", {
      p_company_id: input.companyId,
      p_host: host,
      p_variant: variant,
    });
  } catch (err) {
    console.error("[recordWidgetPlacement]", err);
  }
}
