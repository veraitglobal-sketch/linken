import type { UseCasePage } from "@/features/seo/use-cases/types";

export const tenderReferences: UseCasePage = {
  slug: "references-for-tenders",
  title: "References for tenders",
  description:
    "Use mutually confirmed client and project records in tender and framework responses — live links, not stale annexes.",
  eyebrow: "Tenders & frameworks",
  headline: "Reference packs that stay current",
  lede:
    "Tender teams lose days chasing signed reference letters that expire the week after submission. A Hansala profile is a living annex: confirmed clients and projects, visible to evaluators with a single URL.",
  audience:
    "Bid managers and practice leads responding to public and private tenders who need traceable references without oversharing pending deals.",
  sections: [
    {
      heading: "What evaluators can check",
      paragraphs: [
        "Company identity (and domain verification when present), confirmed client relationships, confirmed partners, and case studies the client has accepted.",
        "They will not see pending invitations or internal draft names. That keeps your pipeline private while still proving completed work.",
      ],
    },
    {
      heading: "How to cite Hansala in a response",
      paragraphs: [
        "Put the public profile URL in the references section. Optionally deep-link a confirmed case study when the tender asks for project evidence.",
        "State plainly what Hansala confirms: mutual acceptance of a relationship or project attribution — not a quality score from Hansala itself.",
      ],
    },
    {
      heading: "Fit with disclosure rules",
      paragraphs: [
        "Some clients must stay unnamed. Hansala supports undisclosed confirmation where the product allows — the confirmation can exist without publishing the client brand.",
        "Never paste claim tokens, invite emails, or admin screenshots into a tender pack.",
      ],
    },
  ],
  checklist: [
    "Confirm at least the references you intend to cite before the deadline",
    "Verify domain so identity matches the bidding entity",
    "Prefer live links over exported screenshots",
    "Align named clients with NDA and tender confidentiality rules",
  ],
  notThis: [
    "Not a tender portal or e-procurement system",
    "Not a guarantee you will win",
    "Not a substitute for mandatory certificates (ISO, insurance, etc.)",
  ],
  relatedSlugs: [
    "verified-client-references",
    "contractor-qualification",
    "supplier-verification",
  ],
};
