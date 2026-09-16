import "server-only";

import { isPublicEmailProvider } from "@/features/verification/domain";
import { computeRankPoints, type RankRecord } from "@/features/ranking/score";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Recompute a company's ranking from its confirmed rows and store it.
 *
 * Called after anything that changes what is confirmed — on both sides of the
 * record, because a confirmation moves two companies. Failures are logged and
 * swallowed: a ranking that is one event stale is a smaller problem than an
 * accept button that throws.
 */

type CompanyMeta = {
  id: string;
  verified: boolean;
  claimed: boolean;
  categorySlug: string | null;
  countryCode: string | null;
};

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

async function loadCompanies(admin: Admin, ids: string[]): Promise<Map<string, CompanyMeta>> {
  const out = new Map<string, CompanyMeta>();
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return out;
  const { data } = await admin
    .from("companies")
    .select("id, verified, claimed, category_slug, country_code")
    .in("id", unique);
  for (const row of data ?? []) {
    out.set(row.id as string, {
      id: row.id as string,
      verified: Boolean(row.verified) && row.claimed !== false,
      claimed: row.claimed !== false,
      categorySlug: (row.category_slug as string | null) ?? null,
      countryCode: (row.country_code as string | null) ?? null,
    });
  }
  return out;
}

/** Every confirmed record a company can earn points from. */
async function collectRecords(admin: Admin, companyId: string): Promise<RankRecord[]> {
  const [partnerships, references, ownCases, partnerRoles, testimonials] = await Promise.all([
    admin
      .from("partnerships")
      .select("requester_id, recipient_id, responded_at")
      .eq("status", "accepted")
      .or(`requester_id.eq.${companyId},recipient_id.eq.${companyId}`),
    admin
      .from("service_references")
      .select("client_company_id, ongoing, confirmed_at")
      .eq("provider_company_id", companyId)
      .eq("status", "confirmed"),
    admin.from("case_studies").select("id").eq("company_id", companyId),
    admin
      .from("case_study_partners")
      .select("case_study_id, confirmed_at, case_studies!inner(company_id)")
      .eq("partner_company_id", companyId)
      .eq("confirmed", true),
    admin
      .from("testimonials")
      .select("author_company_id, author_email, source, source_id, published_at")
      .eq("company_id", companyId)
      .eq("status", "published"),
  ]);

  const records: RankRecord[] = [];
  const counterpartyIds: string[] = [];

  for (const row of partnerships.data ?? []) {
    const other =
      row.requester_id === companyId
        ? (row.recipient_id as string)
        : (row.requester_id as string);
    counterpartyIds.push(other);
    records.push({
      kind: "partner",
      counterpartyId: other,
      counterpartyVerified: false,
      confirmedAt: (row.responded_at as string | null) ?? null,
    });
  }

  for (const row of references.data ?? []) {
    const client = (row.client_company_id as string | null) ?? null;
    if (client) counterpartyIds.push(client);
    records.push({
      kind: row.ongoing ? "ongoing_reference" : "reference",
      counterpartyId: client,
      counterpartyVerified: false,
      confirmedAt: (row.confirmed_at as string | null) ?? null,
    });
  }

  // A client-confirmed project of this company's own case studies.
  const caseIds = (ownCases.data ?? []).map((row) => row.id as string);
  if (caseIds.length > 0) {
    const { data: clientConfirmed } = await admin
      .from("case_study_client_confirmation_requests")
      .select("case_study_id, confirmed_by_company_id, confirmed_at")
      .eq("status", "confirmed")
      .in("case_study_id", caseIds);
    const seen = new Set<string>();
    for (const row of clientConfirmed ?? []) {
      const caseId = row.case_study_id as string;
      if (seen.has(caseId)) continue;
      seen.add(caseId);
      const client = (row.confirmed_by_company_id as string | null) ?? null;
      if (client) counterpartyIds.push(client);
      records.push({
        kind: "case_client",
        counterpartyId: client,
        counterpartyVerified: false,
        confirmedAt: (row.confirmed_at as string | null) ?? null,
      });
    }
  }

  // Projects owned by someone else where this company's role was confirmed.
  for (const row of partnerRoles.data ?? []) {
    const owner = Array.isArray(row.case_studies) ? row.case_studies[0] : row.case_studies;
    const ownerId = (owner?.company_id as string | null) ?? null;
    if (ownerId) counterpartyIds.push(ownerId);
    records.push({
      kind: "case_partner",
      counterpartyId: ownerId,
      counterpartyVerified: false,
      confirmedAt: (row.confirmed_at as string | null) ?? null,
    });
  }

  for (const row of testimonials.data ?? []) {
    const author = (row.author_company_id as string | null) ?? null;
    if (author) counterpartyIds.push(author);
    const email = (row.author_email as string | null) ?? "";
    records.push({
      kind: "testimonial",
      counterpartyId: author,
      counterpartyVerified: false,
      confirmedAt: (row.published_at as string | null) ?? null,
      attached: row.source !== "standalone" && Boolean(row.source_id),
      authorFreeMail: email ? isPublicEmailProvider(email) : !author,
    });
  }

  // One lookup for every counterparty, then mark who proved their domain.
  const meta = await loadCompanies(admin, counterpartyIds);
  for (const record of records) {
    if (record.counterpartyId) {
      record.counterpartyVerified = meta.get(record.counterpartyId)?.verified ?? false;
    }
  }

  return records;
}

/** Recompute and store the ranking for one company. */
export async function refreshCompanyRank(companyId: string): Promise<void> {
  if (!companyId) return;
  const admin = createAdminClient();
  if (!admin) return;

  try {
    const [self] = [...(await loadCompanies(admin, [companyId])).values()];
    if (!self) return;

    const records = await collectRecords(admin, companyId);
    const result = computeRankPoints(records);

    const { error } = await admin.rpc("upsert_company_rank", {
      p_company_id: companyId,
      p_category_slug: self.categorySlug,
      p_country_code: self.countryCode,
      p_points: result.points,
      p_distinct_partners: result.distinctPartners,
      p_confirmed_records: result.confirmedRecords,
      p_last_confirmed_at: result.lastConfirmedAt,
    });
    if (error) console.error("[rank] upsert failed", companyId, error.message);
  } catch (err) {
    console.error("[rank] refresh failed", companyId, err);
  }
}

/**
 * The one call site for everything that confirms, declines or disputes a
 * record. Both sides are recomputed; never awaited by a user-facing action in a
 * way that can fail it.
 */
export async function refreshRank(...companyIds: (string | null | undefined)[]): Promise<void> {
  const ids = [...new Set(companyIds.filter((id): id is string => Boolean(id)))];
  await Promise.all(ids.map((id) => refreshCompanyRank(id)));
}
