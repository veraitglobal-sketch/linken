import "server-only";

import { getActivationChecklist } from "@/features/activation/checklist";
import { getClientAssessmentSummary } from "@/features/assessments/queries";
import {
  getCaseStudiesForCompany,
  isCompanyOwnerSlug,
} from "@/features/case-studies/queries";
import {
  getCompanyForPage,
  searchCompanies,
} from "@/features/companies/queries";
import { getConfirmedGroupForCompany } from "@/features/groups/queries";
import { getPartnershipInbox } from "@/features/partners/inbox";
import {
  getPartnerRailSettings,
  getPartnersForCompany,
} from "@/features/partners/public-queries";
import { getReferencesForCompany } from "@/features/references/queries";
import { getConfirmedProvidersForClient } from "@/features/references/providers-for-client";
import { getPublicTeam } from "@/features/team/queries";
import { resolveConfirmedRelationship } from "@/features/trust/relationship-banner";
import { getTrustProfile } from "@/features/trust/queries";
import {
  getPublishedTestimonials,
  toPublicTestimonials,
} from "@/features/testimonials/queries";
import type { Company } from "@/types/company";

type SearchParams = {
  add?: string;
  q?: string;
  mode?: string;
  rel?: string;
};

/** Parallel public profile loader — confirmed refs for visitors; pending for owners. */
export async function loadPublicCompanyProfile(
  slug: string,
  sp: SearchParams,
) {
  const company = await getCompanyForPage(slug);
  if (!company) return null;

  const isOwner =
    company.claimed !== false ? await isCompanyOwnerSlug(slug) : false;
  const editable = isOwner;
  const showAdd = editable && sp.add === "1";
  const addMode = sp.mode === "draft" ? ("draft" as const) : ("search" as const);
  const q = showAdd && addMode === "search" ? (sp.q ?? "").trim() : "";

  const [
    partners,
    partnerRail,
    caseStudies,
    references,
    providers,
    trust,
    assessmentSummary,
    groupBadge,
    teamMembers,
    relationship,
    testimonials,
    checklist,
    inbox,
    searchHits,
  ] = await Promise.all([
    getPartnersForCompany(company.id),
    getPartnerRailSettings(company.id),
    getCaseStudiesForCompany(company.id, { confirmedOnly: !isOwner }),
    getReferencesForCompany(company.id, { includePending: isOwner }),
    company.claimed !== false
      ? getConfirmedProvidersForClient(company.id)
      : Promise.resolve([]),
    getTrustProfile(company.id, company.slug),
    getClientAssessmentSummary(company.id),
    getConfirmedGroupForCompany(company.id),
    getPublicTeam(company.id),
    resolveConfirmedRelationship(company.id, sp.rel),
    getPublishedTestimonials(company.id).then((rows) =>
      toPublicTestimonials(rows, company.slug),
    ),
    editable ? getActivationChecklist(company.id) : Promise.resolve(null),
    showAdd ? getPartnershipInbox(company.id) : Promise.resolve(null),
    showAdd && q ? searchCompanies(q) : Promise.resolve([] as Company[]),
  ]);

  const statusBySlug = new Map<string, string>();
  if (inbox) {
    for (const row of inbox.outgoingPending) {
      statusBySlug.set(row.other.slug, "Pending");
    }
    for (const row of inbox.incomingPending) {
      statusBySlug.set(row.other.slug, "Incoming");
    }
    for (const row of inbox.accepted) {
      statusBySlug.set(row.other.slug, "Official");
    }
  }

  return {
    company,
    isOwner,
    editable,
    showAdd,
    addMode,
    q,
    partners,
    partnerRail,
    caseStudies,
    references,
    providers,
    trust,
    assessmentSummary,
    groupBadge,
    teamMembers,
    relationship,
    testimonials,
    checklist,
    addResults: searchHits.filter((c) => c.slug !== company.slug),
    statusBySlug,
  };
}
