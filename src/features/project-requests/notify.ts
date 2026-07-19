import "server-only";

import { sendProjectRequestDigestEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

/** Enqueue + send digest emails (max 1/day per verified firm). */
export async function notifyMatchingCompanies(requestId: string) {
  const admin = createAdminClient();
  if (!admin) {
    console.warn(
      "SUPABASE_SERVICE_ROLE_KEY not configured — request digest skipped.",
    );
    return;
  }

  const { data, error } = await admin.rpc("prepare_request_notifications", {
    p_request_id: requestId,
  });

  if (error) {
    console.error("prepare_request_notifications:", error.message);
    return;
  }

  for (const row of data ?? []) {
    const r = row as {
      notify_email?: string;
      company_name?: string;
      request_titles?: string[];
    };
    const email = String(r.notify_email ?? "");
    const companyName = String(r.company_name ?? "");
    const titles = (r.request_titles ?? []) as string[];
    if (!email || titles.length === 0) continue;

    await sendProjectRequestDigestEmail({
      to: email,
      companyName,
      requestTitles: titles,
    });
  }
}
