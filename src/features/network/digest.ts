import "server-only";

import { sendNetworkDigestEmail } from "@/lib/email/network-digest";
import { createAdminClient } from "@/lib/supabase/admin";

type DigestStats = {
  profileViews: number;
  embedViews: number;
};

async function loadWeekStats(companyId: string): Promise<DigestStats> {
  const admin = createAdminClient();
  if (!admin) return { profileViews: 0, embedViews: 0 };

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data } = await admin
    .from("profile_events")
    .select("event_type")
    .eq("company_id", companyId)
    .gte("created_at", since.toISOString())
    .in("event_type", ["profile_view", "embed_view"]);

  let profileViews = 0;
  let embedViews = 0;
  for (const row of data ?? []) {
    if (row.event_type === "profile_view") profileViews += 1;
    if (row.event_type === "embed_view") embedViews += 1;
  }
  return { profileViews, embedViews };
}

/** Send one company's weekly network digest when opted in. */
export async function sendNetworkDigestAdmin(
  companyId: string,
): Promise<{ ok: boolean; skipped?: boolean; reason?: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, reason: "service_role_missing" };

  const { data: company } = await admin
    .from("companies")
    .select(
      "id, name, slug, owner_id, network_digest_opt_in, network_digest_last_sent_at, claimed",
    )
    .eq("id", companyId)
    .maybeSingle();

  if (!company?.claimed || !company.network_digest_opt_in) {
    return { ok: true, skipped: true, reason: "not_opted_in" };
  }

  const last = company.network_digest_last_sent_at
    ? new Date(company.network_digest_last_sent_at as string).getTime()
    : 0;
  if (last && Date.now() - last < 6 * 24 * 60 * 60 * 1000) {
    return { ok: true, skipped: true, reason: "already_sent" };
  }

  const { data: user } = await admin.auth.admin.getUserById(
    company.owner_id as string,
  );
  const email = user.user?.email;
  if (!email) return { ok: false, reason: "no_owner_email" };

  const stats = await loadWeekStats(companyId);
  if (stats.profileViews === 0 && stats.embedViews === 0) {
    return { ok: true, skipped: true, reason: "empty" };
  }

  const result = await sendNetworkDigestEmail({
    to: email,
    companyName: String(company.name ?? "Your company"),
    companySlug: String(company.slug),
    profileViews: stats.profileViews,
    embedViews: stats.embedViews,
    partnerHint:
      "Tip: open a shared pair page (/c/you/with/partner) and share the link — both sides benefit.",
  });

  if (!result.ok) return { ok: false, reason: "email_failed" };

  await admin
    .from("companies")
    .update({ network_digest_last_sent_at: new Date().toISOString() })
    .eq("id", companyId);

  return { ok: true };
}
