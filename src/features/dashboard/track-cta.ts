"use server";

import { logActivationEvent } from "@/features/activation/events";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";

/** Allowed CTA ids only — never free-form user text. */
const ALLOWED = new Set([
  "create_company",
  "fix_billing",
  "verify_domain",
  "add_relationship",
  "send_invite",
  "follow_up",
  "share_proof",
  "add_another",
  "complete_profile",
  "open_map",
  "open_one_pager",
  "dismiss_setup",
]);

/**
 * Track dashboard CTA for the operator’s active company only.
 * Client-supplied companyId is ignored (tenant isolation).
 */
export async function trackDashboardCta(
  _ignoredClientCompanyId: string,
  ctaId: string,
) {
  if (!ALLOWED.has(ctaId)) return;
  const { user, company } = await getOperatorActiveCompany();
  if (!user || !company) return;
  await logActivationEvent(company.id, "dashboard_cta_clicked", ctaId);
}
