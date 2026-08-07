import type { UseCasePage } from "@/features/seo/use-cases/types";

export const architectureRefs: UseCasePage = {
  slug: "architecture-firm-references",
  title: "Architecture firm references",
  description:
    "Architecture practices: publish confirmed clients, collaborators, and projects without inventing a portfolio.",
  eyebrow: "Architecture",
  headline: "Practice credentials with mutual confirmation",
  lede:
    "Architecture marketing often leans on unnamed “confidential residential” and logo strips clients never approved. Hansala lets a practice show what clients and collaborators have actually confirmed.",
  audience:
    "Architecture firms responding to competitions, frameworks, and developer RFPs who need credible references without oversharing unbuilt work.",
  sections: [
    {
      heading: "Clients, collaborators, projects",
      paragraphs: [
        "Confirmed clients show engagements both sides accepted. Confirmed partners cover engineers, landscape, and specialty consultants when they confirm the collaboration.",
        "Case studies can carry client confirmation separately from partner links — so a project page can show who stood behind the attribution.",
      ],
    },
    {
      heading: "Confidentiality",
      paragraphs: [
        "Where a client cannot be named, use undisclosed confirmation when available rather than inventing a cover name that implies a real brand.",
        "Never publish photos or metrics you do not have rights to. Absence of a section is better than a placeholder.",
      ],
    },
    {
      heading: "Competitions and frameworks",
      paragraphs: [
        "Link your Hansala profile in competition dossiers. Evaluators can open confirmed work without downloading a second reference binder.",
        "Domain verification helps when the practice brand and legal entity differ — prove control of the public domain you market.",
      ],
    },
  ],
  checklist: [
    "List services and locations accurately on the company profile",
    "Invite clients after handover or key project milestones",
    "Confirm key engineering and specialty partners you cite publicly",
    "Keep unbuilt competition schemes off the public record until appropriate",
  ],
  notThis: [
    "Not a project gallery CMS for every sketch",
    "Not an awards submission portal",
    "Not a planning or building-control service",
  ],
  relatedSlugs: [
    "engineering-company-references",
    "verified-project-portfolio",
    "references-for-tenders",
  ],
};
