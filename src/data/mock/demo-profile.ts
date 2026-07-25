import {
  DEMO_CASE_STUDIES,
  getDemoCaseStudy,
} from "@/data/mock/demo-cases";
import {
  DEMO_COMPANY,
  DEMO_PARTNERS,
  DEMO_REFERENCES,
} from "@/data/mock/demo-company";
import type { ClientAssessmentSummary } from "@/features/assessments/queries";
import type { TrustProfile } from "@/features/trust/queries";
import {
  computeTrustScore,
  getTrustNextStep,
} from "@/features/trust/score";

export {
  DEMO_CASE_STUDIES,
  DEMO_COMPANY,
  DEMO_PARTNERS,
  DEMO_REFERENCES,
  getDemoCaseStudy,
};

export function getDemoTrust(): TrustProfile {
  const result = computeTrustScore({
    confirmedPartners: DEMO_PARTNERS.length,
    confirmedReferences: 1,
    ongoingReferences: 1,
    clientConfirmedCaseStudies: DEMO_CASE_STUDIES.length,
    partnerConfirmedCaseStudies: DEMO_CASE_STUDIES.length,
  });
  return {
    ...result,
    nextStep: getTrustNextStep(result, DEMO_COMPANY.slug),
  };
}

export const DEMO_ASSESSMENT: ClientAssessmentSummary = {
  assessmentCount: 4,
  wouldWorkAgainYes: 4,
  wouldWorkAgainTotal: 4,
  topStrengths: [
    { key: "reliability", label: "Reliability", count: 3 },
    { key: "communication", label: "Communication", count: 2 },
  ],
};
