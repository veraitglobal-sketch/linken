import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type EmailSuppressionRow = {
  id: string;
  kind: string;
  value: string;
  reason: string;
  createdAt: string;
};

export type DeliverabilityEventRow = {
  id: string;
  eventType: string;
  email: string;
  domain: string;
  createdAt: string;
};

export type CompanyEmailVolumeRow = {
  companyId: string;
  companyName: string;
  partnershipInvites: number;
  caseStudyConfirmations: number;
  referenceInvites: number;
  total: number;
};

export async function listSuppressions(limit = 200): Promise<EmailSuppressionRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("email_suppressions")
    .select("id, kind, value, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    kind: r.kind as string,
    value: r.value as string,
    reason: r.reason as string,
    createdAt: r.created_at as string,
  }));
}

export async function listDeliverabilityEvents(
  limit = 200,
): Promise<DeliverabilityEventRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("email_deliverability_events")
    .select("id, event_type, email, domain, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    eventType: r.event_type as string,
    email: (r.email as string) ?? "",
    domain: (r.domain as string) ?? "",
    createdAt: r.created_at as string,
  }));
}

function countBy(rows: { id: string }[] | null, key: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of (rows ?? []) as Record<string, unknown>[]) {
    const value = row[key] as string | null;
    if (!value) continue;
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return map;
}

/** Rough per-company outbound-email volume from the invite-triggering tables. */
export async function listEmailVolumeByCompany(
  limit = 30,
  scanLimit = 2000,
): Promise<CompanyEmailVolumeRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const [partnerships, confirmations, references] = await Promise.all([
    admin
      .from("partnerships")
      .select("id, recipient_id")
      .order("created_at", { ascending: false })
      .limit(scanLimit),
    admin
      .from("case_study_client_confirmation_requests")
      .select("id, requested_by_company_id")
      .order("created_at", { ascending: false })
      .limit(scanLimit),
    admin
      .from("service_references")
      .select("id, provider_company_id, invite_email")
      .not("invite_email", "is", null)
      .order("created_at", { ascending: false })
      .limit(scanLimit),
  ]);

  const partnershipCounts = countBy(partnerships.data, "recipient_id");
  const confirmCounts = countBy(confirmations.data, "requested_by_company_id");
  const referenceCounts = countBy(references.data, "provider_company_id");

  const companyIds = new Set([
    ...partnershipCounts.keys(),
    ...confirmCounts.keys(),
    ...referenceCounts.keys(),
  ]);
  if (companyIds.size === 0) return [];

  const { data: companies } = await admin
    .from("companies")
    .select("id, name")
    .in("id", [...companyIds]);
  const names = new Map((companies ?? []).map((c) => [c.id as string, c.name as string]));

  return [...companyIds]
    .map((id) => {
      const partnershipInvites = partnershipCounts.get(id) ?? 0;
      const caseStudyConfirmations = confirmCounts.get(id) ?? 0;
      const referenceInvites = referenceCounts.get(id) ?? 0;
      return {
        companyId: id,
        companyName: names.get(id) ?? "—",
        partnershipInvites,
        caseStudyConfirmations,
        referenceInvites,
        total: partnershipInvites + caseStudyConfirmations + referenceInvites,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}
