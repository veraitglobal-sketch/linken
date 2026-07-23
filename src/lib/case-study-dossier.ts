/** Proof score + layer status for dossier UI. */
import type { CaseStudy } from "@/types/case-study";

export type DossierCompanyContext = { name: string; verified: boolean };

export type DossierLayer = {
  id: string;
  label: string;
  ok: boolean;
  kind: "verified" | "self-reported" | "uploaded" | "pending";
};

export function dossierProofScore(cs: CaseStudy, company: DossierCompanyContext) {
  const clientOk = cs.clientConfirmation?.status === "confirmed";
  const partnersOk = cs.partners.some((p) => p.confirmed);
  const layers: DossierLayer[] = [
    {
      id: "client",
      label: "Client seal",
      ok: clientOk,
      kind: clientOk ? "verified" : "pending",
    },
    {
      id: "partners",
      label: "Partner roles",
      ok: partnersOk,
      kind: partnersOk ? "verified" : "pending",
    },
    {
      id: "publisher",
      label: "Publisher domain",
      ok: company.verified,
      kind: company.verified ? "verified" : "pending",
    },
    {
      id: "narrative",
      label: "Project record",
      ok: Boolean(cs.challenge && cs.outcome),
      kind: "self-reported",
    },
    {
      id: "metrics",
      label: "Impact data",
      ok: cs.metrics.length > 0 || Boolean(cs.highlightStat),
      kind: cs.metrics.length > 0 ? "self-reported" : "pending",
    },
    {
      id: "visuals",
      label: "Exhibit photos",
      ok: Boolean(cs.coverImageUrl && cs.galleryUrls.length),
      kind: cs.coverImageUrl ? "uploaded" : "pending",
    },
  ];
  const verified = layers.filter((l) => l.ok && l.kind === "verified").length;
  const score = layers.filter((l) => l.ok).length;
  const stamp = verified >= 2 ? "verified" : score >= 4 ? "partial" : "open";
  return { layers, score, total: layers.length, stamp, verified };
}

export function dossierFileId(slug: string, year: string) {
  const y = year || new Date().getFullYear().toString();
  return `HS-${y.slice(-2)}-${slug.slice(0, 12).toUpperCase()}`;
}
