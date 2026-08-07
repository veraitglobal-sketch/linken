import type { UseCasePage } from "@/features/seo/use-cases/types";

export const contractorQual: UseCasePage = {
  slug: "contractor-qualification",
  title: "Contractor qualification",
  description:
    "Qualify contractors with mutually confirmed clients, partners, and projects — evidence that travels with the firm.",
  eyebrow: "Contractor qualification",
  headline: "Qualification evidence that does not go stale",
  lede:
    "Prequalification packs age the day they are PDF’d. A contractor’s Hansala profile keeps confirmed clients, partners, and projects available to owners, GCs, and framework managers between bids.",
  audience:
    "General contractors, specialist trades, and owner’s teams who need relationship evidence alongside insurance and safety files.",
  sections: [
    {
      heading: "What to put on the public record",
      paragraphs: [
        "Confirmed client engagements with service and date ranges. Confirmed partners when you work as a joint team. Case studies when the client accepts attribution.",
        "Keep marketing claims on your site; keep mutual confirmations on Hansala. Mixing the two without labels is how diligence breaks down.",
      ],
    },
    {
      heading: "For owners and GCs reviewing contractors",
      paragraphs: [
        "Ask for the Hansala link in prequalification. Confirm that named projects match what you see on the profile.",
        "Domain verification helps when legal entity names differ across subsidiaries — each company verifies its own domain.",
      ],
    },
    {
      heading: "Safety and compliance stay elsewhere",
      paragraphs: [
        "Hansala is not your safety management system. Pair confirmed commercial relationships with the certificates and audits your sector requires.",
        "We never invent project values, headcounts, or “approved contractor” seals.",
      ],
    },
  ],
  checklist: [
    "Invite clients after meaningful completed work",
    "Keep company name and website aligned with the bidding entity",
    "Use the profile URL in prequalification responses",
    "Report incorrect public facts via the profile report path",
  ],
  notThis: [
    "Not a construction bidding marketplace",
    "Not a substitute for bonding or insurance proof",
    "Not a public dispute board",
  ],
  relatedSlugs: [
    "references-for-tenders",
    "engineering-company-references",
    "supplier-verification",
  ],
};
