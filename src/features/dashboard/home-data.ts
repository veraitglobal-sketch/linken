import "server-only";

import { getActivationChecklist } from "@/features/activation/checklist";
import { getAnalytics } from "@/features/analytics/queries";
import { loadBillingRow } from "@/features/billing/sync";
import {
  deriveHomeKind,
  primaryActionFor,
  type DashboardHomeKind,
  type HomePrimaryAction,
} from "@/features/dashboard/home-state";
import {
  profileCompleteness,
  type ProfileCompleteness,
} from "@/features/dashboard/profile-completeness";
import { getPartnershipInbox } from "@/features/partners/inbox";
import {
  canUseFullAnalytics,
  isBillingFailure,
  isPaidPlan,
} from "@/features/plan/access";
import { createClient } from "@/lib/supabase/server";
import type { DashboardCompany } from "@/features/workspace/types";

export type DashboardHomeModel = {
  kind: DashboardHomeKind;
  primary: HomePrimaryAction;
  completeness: ProfileCompleteness;
  pendingOutgoing: number;
  pendingIncoming: number;
  confirmedPartners: number;
  confirmedRefs: number;
  caseCount: number;
  activated: boolean;
  proofShared: boolean;
  isPro: boolean;
  billingProblem: boolean;
  showDeveloperLinks: boolean;
  analytics: {
    profileViews: number;
    embedViews: number;
    inquiries: number;
  } | null;
  checklist: Awaited<ReturnType<typeof getActivationChecklist>>;
};

export async function loadDashboardHome(
  company: DashboardCompany,
): Promise<DashboardHomeModel> {
  const supabase = await createClient();

  const [
    checklist,
    inbox,
    billing,
    refsRes,
    casesRes,
    analytics,
    keysRes,
  ] = await Promise.all([
    getActivationChecklist(company.id),
    getPartnershipInbox(company.id),
    loadBillingRow(supabase, company.id),
    supabase
      .from("service_references")
      .select("id, status, invite_email")
      .eq("provider_company_id", company.id),
    supabase
      .from("case_studies")
      .select("id")
      .eq("company_id", company.id),
    canUseFullAnalytics(company.plan)
      ? getAnalytics(company.id, 30)
      : Promise.resolve(null),
    isPaidPlan(company.plan)
      ? supabase
          .from("api_keys")
          .select("id")
          .eq("company_id", company.id)
          .is("revoked_at", null)
          .limit(1)
      : Promise.resolve({ data: [] }),
  ]);

  const refs = refsRes.data ?? [];
  const confirmedRefs = refs.filter((r) => r.status === "confirmed").length;
  const caseCount = (casesRes.data ?? []).length;
  const confirmedPartners = inbox.accepted.length;
  const confirmedCount = confirmedRefs + confirmedPartners;
  const invitationSent =
    refs.some((r) => Boolean(r.invite_email?.trim())) ||
    inbox.outgoingPending.length > 0 ||
    Boolean(checklist?.steps.find((s) => s.id === "first_invitation_sent")?.done);
  const relationshipCount =
    refs.length + caseCount + inbox.outgoingPending.length + confirmedPartners;
  const proofShared = Boolean(
    checklist?.steps.find((s) => s.id === "proof_shared")?.done,
  );
  const billingProblem = isBillingFailure(billing?.billing_status);
  const isPro = isPaidPlan(company.plan);
  const completeness = profileCompleteness({
    slug: company.slug,
    name: company.name,
    website: company.website,
    category: company.category,
    city: company.city,
    verified: company.verified,
  });

  const kind = deriveHomeKind({
    hasCompany: true,
    verified: company.verified,
    relationshipCount,
    invitationSent,
    pendingInvites: inbox.outgoingPending.length + inbox.incomingPending.length,
    confirmedCount,
    proofShared,
    isPro,
    billingProblem,
    profileComplete: completeness.complete,
  });

  const hasApiKeys = (keysRes.data ?? []).length > 0;

  return {
    kind,
    primary: primaryActionFor(kind, company.slug),
    completeness,
    pendingOutgoing: inbox.outgoingPending.length,
    pendingIncoming: inbox.incomingPending.length,
    confirmedPartners,
    confirmedRefs,
    caseCount,
    activated: Boolean(checklist?.activated),
    proofShared,
    isPro,
    billingProblem,
    showDeveloperLinks: isPro && hasApiKeys,
    analytics: analytics
      ? {
          profileViews: analytics.profileViews,
          embedViews: analytics.embedViews,
          inquiries: analytics.inquiries,
        }
      : null,
    checklist,
  };
}
