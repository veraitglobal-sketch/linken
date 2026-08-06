import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { signalsFromRows } from "@/features/activation/derive";

export type RegistrationProgress = {
  doneCount: number;
  total: number;
  nextStep: string | null;
};

const STEP_LABELS = [
  "Company profile created",
  "Domain verified",
  "First project or relationship added",
  "First invitation sent",
  "First reference confirmed",
  "Verified proof shared",
] as const;

type CompanySeed = { id: string; verified: boolean; slug?: string };

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

  const partnerships = [
    ...(reqPartnerships.data ?? []),
    ...(recPartnerships.data ?? []),
  ];
  const websiteByCompany = new Map(
    (verifications.data ?? []).map((v) => [
      v.company_id as string,
      Boolean(v.website_linked),
    ]),
  );
  const embedCompanies = new Set(
    (embeds.data ?? []).map((e) => e.company_id as string),
  );

  for (const company of companies) {
    const cid = company.id;
    const companyCases = caseByCompany.get(cid) ?? [];
    const companyPartnerships = partnerships
      .filter((p) => p.requester_id === cid || p.recipient_id === cid)
      .map((p) => ({ status: p.status as string }));
    const companyRefs = (refs.data ?? [])
      .filter((r) => r.provider_company_id === cid)
      .map((r) => ({
        status: r.status as string,
        invite_email: (r.invite_email as string | null) ?? null,
      }));
    const companyConfs = (confReqs.data ?? [])
      .filter((r) => r.requested_by_company_id === cid)
      .map((r) => ({
        status: r.status as string,
        email: (r.email as string | null) ?? null,
      }));

    const signals = signalsFromRows({
      companySlug: company.slug ?? cid,
      verified: company.verified,
      refs: companyRefs,
      caseCount: companyCases.length,
      confReqs: companyConfs,
      partnerships: companyPartnerships,
      hasConfirmedCasePartner: companyCases.some((id) =>
        confirmedCases.has(id),
      ),
      websiteLinked: websiteByCompany.get(cid) ?? false,
      hasEmbedView: embedCompanies.has(cid),
    });

    const flags = [
      true,
      signals.verified,
      signals.hasRelationship,
      signals.hasInvitationSent,
      signals.hasConfirmation,
      signals.hasProofShared,
    ];
    const doneCount = flags.filter(Boolean).length;
    const nextIdx = flags.findIndex((f) => !f);
    out.set(company.id, {
      doneCount,
      total: STEP_LABELS.length,
      nextStep: nextIdx >= 0 ? STEP_LABELS[nextIdx]! : null,
    });
  }

  return out;
}
