import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type RegistrationProgress = {
  doneCount: number;
  total: number;
  nextStep: string | null;
};

const STEPS = [
  { key: "verified", label: "Verify domain" },
  { key: "partner", label: "Invite partner" },
  { key: "evidence", label: "Add evidence" },
  { key: "sent", label: "Send confirmation" },
  { key: "confirmed", label: "Get confirmation" },
  { key: "badge", label: "Embed badge" },
] as const;

type CompanySeed = { id: string; verified: boolean };

export async function batchRegistrationProgress(
  admin: SupabaseClient,
  companies: CompanySeed[],
): Promise<Map<string, RegistrationProgress>> {
  const ids = companies.map((c) => c.id);
  const out = new Map<string, RegistrationProgress>();
  if (ids.length === 0) return out;

  const [
    reqPartnerships,
    recPartnerships,
    refs,
    cases,
    confReqs,
    verifications,
    embeds,
  ] = await Promise.all([
    admin
      .from("partnerships")
      .select("requester_id, recipient_id, status")
      .in("requester_id", ids),
    admin
      .from("partnerships")
      .select("requester_id, recipient_id, status")
      .in("recipient_id", ids),
    admin
      .from("service_references")
      .select("provider_company_id, status, invite_email")
      .in("provider_company_id", ids),
    admin.from("case_studies").select("id, company_id").in("company_id", ids),
    admin
      .from("case_study_client_confirmation_requests")
      .select("requested_by_company_id, status, email")
      .in("requested_by_company_id", ids),
    admin
      .from("company_verifications")
      .select("company_id, website_linked")
      .in("company_id", ids),
    admin
      .from("profile_events")
      .select("company_id")
      .in("company_id", ids)
      .eq("event_type", "embed_view"),
  ]);

  const caseIds = (cases.data ?? []).map((c) => c.id as string);
  let confirmedCases = new Set<string>();
  if (caseIds.length > 0) {
    const { data: partners } = await admin
      .from("case_study_partners")
      .select("case_study_id")
      .eq("confirmed", true)
      .in("case_study_id", caseIds);
    confirmedCases = new Set(
      (partners ?? []).map((p) => p.case_study_id as string),
    );
  }

  const caseByCompany = new Map<string, string[]>();
  for (const row of cases.data ?? []) {
    const cid = row.company_id as string;
    const list = caseByCompany.get(cid) ?? [];
    list.push(row.id as string);
    caseByCompany.set(cid, list);
  }

  const partnerships = [...(reqPartnerships.data ?? []), ...(recPartnerships.data ?? [])];
  const signals = buildSignals(ids, {
    partnerships,
    refs: refs.data ?? [],
    caseByCompany,
    confirmedCases,
    confReqs: confReqs.data ?? [],
    verifications: verifications.data ?? [],
    embeds: embeds.data ?? [],
  });

  for (const company of companies) {
    const s = signals.get(company.id)!;
    const flags = {
      verified: company.verified,
      partner: s.hasPartnership,
      evidence: s.hasEvidence,
      sent: s.hasSentConfirmation,
      confirmed: s.hasConfirmation,
      badge: s.hasBadge,
    };
    const done = STEPS.filter((step) => flags[step.key]).length;
    const next = STEPS.find((step) => !flags[step.key])?.label ?? null;
    out.set(company.id, { doneCount: done, total: STEPS.length, nextStep: next });
  }

  return out;
}

function buildSignals(
  ids: string[],
  data: {
    partnerships: { requester_id: string; recipient_id: string; status: string }[];
    refs: { provider_company_id: string; status: string; invite_email: string | null }[];
    caseByCompany: Map<string, string[]>;
    confirmedCases: Set<string>;
    confReqs: { requested_by_company_id: string; status: string; email: string | null }[];
    verifications: { company_id: string; website_linked: boolean | null }[];
    embeds: { company_id: string }[];
  },
) {
  const map = new Map(
    ids.map((id) => [
      id,
      {
        hasPartnership: false,
        hasEvidence: false,
        hasSentConfirmation: false,
        hasConfirmation: false,
        hasBadge: false,
      },
    ]),
  );

  for (const p of data.partnerships) {
    for (const cid of [p.requester_id, p.recipient_id]) {
      const s = map.get(cid);
      if (!s) continue;
      s.hasPartnership = true;
      if (p.status === "accepted") s.hasConfirmation = true;
    }
  }

  for (const r of data.refs) {
    const s = map.get(r.provider_company_id);
    if (!s) continue;
    s.hasEvidence = true;
    if (r.invite_email?.trim()) s.hasSentConfirmation = true;
    if (r.status === "confirmed") s.hasConfirmation = true;
  }

  for (const [cid, caseList] of data.caseByCompany) {
    const s = map.get(cid);
    if (!s) continue;
    s.hasEvidence = true;
    if (caseList.some((id) => data.confirmedCases.has(id))) {
      s.hasConfirmation = true;
    }
  }

  for (const c of data.confReqs) {
    const s = map.get(c.requested_by_company_id);
    if (!s) continue;
    if (c.email?.trim()) s.hasSentConfirmation = true;
    if (c.status === "confirmed") s.hasConfirmation = true;
  }

  for (const v of data.verifications) {
    if (v.website_linked) {
      const s = map.get(v.company_id);
      if (s) s.hasBadge = true;
    }
  }

  for (const e of data.embeds) {
    const s = map.get(e.company_id);
    if (s) s.hasBadge = true;
  }

  return map;
}
