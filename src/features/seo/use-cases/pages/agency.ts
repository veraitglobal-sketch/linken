import type { UseCasePage } from "@/features/seo/use-cases/types";

export const agencyCaseStudy: UseCasePage = {
  slug: "agency-case-study-verification",
  title: "Agency case study verification",
  description:
    "Agencies: client-confirmed case studies and references you can embed — without rewriting the client’s words.",
  eyebrow: "Agencies",
  headline: "Case studies clients will actually stand behind",
  lede:
    "Agency sites fill with case studies marketing wrote alone. Hansala adds a confirmation path: the client can accept the attribution, and author-locked testimonials cannot be edited by the agency afterward.",
  audience:
    "Brand, digital, and creative agencies that need proof for new-business decks and website proof sections.",
  sections: [
    {
      heading: "Confirmation without quote tampering",
      paragraphs: [
        "When a client leaves a testimonial through their token, the body, name, and role stay immutable on the receiving side — including via API.",
        "Case study confirmation is separate: it ties the project page to the client’s acceptance of attribution, not a star rating.",
      ],
    },
    {
      heading: "Embeds for new business",
      paragraphs: [
        "Paste once; configure theme from the dashboard. New confirmed clients appear without a site deploy.",
        "Widgets carry the verification mark only — no Hansala marketing chrome on the customer’s site, and no plan-tier badges.",
      ],
    },
    {
      heading: "NDAs and unnamed work",
      paragraphs: [
        "Some retainers cannot name the brand. Prefer undisclosed confirmation over inventing a fake “global retailer” that implies a specific company.",
        "Never invent metrics. If the client did not confirm a number, leave it off the public page.",
      ],
    },
  ],
  checklist: [
    "Request confirmation on flagship case studies first",
    "Use author tokens for quotes — do not paste paraphrased praise",
    "Embed only confirmed records on the marketing site",
    "Keep pending pitches out of public profiles",
  ],
  notThis: [
    "Not a creative awards platform",
    "Not a media kit generator with stock logos",
    "Not a CRM for pitch tracking",
  ],
  relatedSlugs: [
    "verified-project-portfolio",
    "verified-client-references",
    "supplier-verification",
  ],
};
