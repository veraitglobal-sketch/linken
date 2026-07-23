import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

export type BlueprintPillar = {
  id: string;
  label: string;
  hint: string;
  done: boolean;
  tab: "visual" | "story" | "proof" | "client";
};

export type EvidenceRow = {
  label: string;
  detail: string;
  kind: "verified" | "self-reported" | "uploaded" | "pending";
};

/** Eight pillars every premium B2B case study should cover. */
export function caseStudyBlueprint(
  cs: CaseStudy,
  companyVerified: boolean,
): BlueprintPillar[] {
  const clientOk = cs.clientConfirmation?.status === "confirmed";
  const partnersOk = cs.partners.some((p) => p.confirmed);

  return [
    {
      id: "hook",
      label: "Hook",
      hint: "Title + summary that earns the click",
      done: Boolean(cs.title.trim() && cs.summary.trim()),
      tab: "story",
    },
    {
      id: "context",
      label: "Context",
      hint: "Where, when, sector, duration",
      done: Boolean(
        cs.location.trim() &&
          cs.year.trim() &&
          (cs.sector.trim() || cs.duration.trim()),
      ),
      tab: "story",
    },
    {
      id: "challenge",
      label: "Challenge",
      hint: "Problem and constraints",
      done: Boolean(cs.challenge.trim()),
      tab: "story",
    },
    {
      id: "approach",
      label: "Approach",
      hint: "How the work was delivered",
      done: Boolean(cs.process.trim()),
      tab: "story",
    },
    {
      id: "results",
      label: "Results",
      hint: "Outcome + measurable impact",
      done: Boolean(
        cs.outcome.trim() &&
          (cs.highlightStat.trim() || cs.metrics.length > 0),
      ),
      tab: "proof",
    },
    {
      id: "proof",
      label: "Proof",
      hint: "Client or partner confirmation",
      done: clientOk || partnersOk,
      tab: "client",
    },
    {
      id: "visuals",
      label: "Visuals",
      hint: "Cover photo + project gallery",
      done: Boolean(cs.coverImageUrl && cs.galleryUrls.length > 0),
      tab: "visual",
    },
    {
      id: "voice",
      label: "Voice",
      hint: "Client quote in their words",
      done: Boolean(cs.clientQuote.trim()),
      tab: "proof",
    },
  ];
}

export function blueprintScore(pillars: BlueprintPillar[]) {
  const done = pillars.filter((p) => p.done).length;
  return { done, total: pillars.length };
}

/** Hansala-only — every claim tagged by evidence type. */
export function caseStudyEvidenceLedger(
  cs: CaseStudy,
  company: Company,
): EvidenceRow[] {
  const clientOk = cs.clientConfirmation?.status === "confirmed";
  const confirmedPartners = cs.partners.filter((p) => p.confirmed);

  const rows: EvidenceRow[] = [
    {
      label: "Project narrative",
      detail: "Challenge, approach, and outcome written by the publisher.",
      kind: "self-reported",
    },
    {
      label: "Impact metrics",
      detail:
        cs.metrics.length > 0
          ? `${cs.metrics.length} KPI${cs.metrics.length > 1 ? "s" : ""} published by the firm.`
          : "No metrics yet — add them in Proof.",
      kind: cs.metrics.length > 0 ? "self-reported" : "pending",
    },
    {
      label: "Project photography",
      detail:
        cs.coverImageUrl || cs.galleryUrls.length
          ? "Cover and gallery uploaded by the publisher."
          : "Add cover and gallery in Visuals.",
      kind:
        cs.coverImageUrl || cs.galleryUrls.length ? "uploaded" : "pending",
    },
    {
      label: "Client confirmed delivery",
      detail: clientOk
        ? `${cs.clientConfirmation?.confirmedBy?.name ?? "Client"} confirmed this project on Hansala.`
        : "Pending — invite the client to confirm.",
      kind: clientOk ? "verified" : "pending",
    },
    {
      label: "Partner roles",
      detail:
        confirmedPartners.length > 0
          ? `${confirmedPartners.map((p) => p.name).join(", ")} confirmed their roles.`
          : cs.partners.length
            ? "Partners tagged — awaiting their confirmation."
            : "Tag partners who worked on this case.",
      kind: confirmedPartners.length > 0 ? "verified" : "pending",
    },
    {
      label: "Publisher verification",
      detail: company.verified
        ? `${company.name} has a verified domain on Hansala.`
        : "Domain verification strengthens the publisher layer.",
      kind: company.verified ? "verified" : "pending",
    },
  ];

  if (cs.clientQuote.trim()) {
    rows.splice(3, 0, {
      label: "Client quote",
      detail: clientOk
        ? "Quote shown with client confirmation badge."
        : "Quote published — strongest when the client confirms.",
      kind: clientOk ? "verified" : "self-reported",
    });
  }

  return rows;
}
