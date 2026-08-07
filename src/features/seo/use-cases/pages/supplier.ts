import type { UseCasePage } from "@/features/seo/use-cases/types";

export const supplierVerification: UseCasePage = {
  slug: "supplier-verification",
  title: "Supplier verification",
  description:
    "Check whether a supplier’s stated clients and partners are mutually confirmed — before you put them on a preferred list.",
  eyebrow: "Supplier diligence",
  headline: "Diligence that starts with confirmation",
  lede:
    "Self-reported supplier decks list logos that may never have consented. Hansala shows relationships only after both sides confirm — so procurement can separate marketing from mutual record.",
  audience:
    "Procurement, vendor management, and partner teams evaluating suppliers for panels, MSAs, and strategic shortlists.",
  sections: [
    {
      heading: "Signals that matter",
      paragraphs: [
        "Domain verification: the company proved control of a matching business domain or approved identity method. It is not a paid tier.",
        "Confirmed partners and clients: each link required acceptance by the other company. Absence of a link is not a negative finding — new firms start empty.",
      ],
    },
    {
      heading: "How to read a profile",
      paragraphs: [
        "Open the public URL. Look for confirmed sections, not decorative trust badges. Pending states are never shown to visitors.",
        "If a supplier claims a logo that is not on their Hansala profile, ask them to invite that client — or treat the claim as unverified marketing.",
      ],
    },
    {
      heading: "Limits of the record",
      paragraphs: [
        "Hansala does not score quality, financial health, or compliance certifications. We record mutual confirmation and identity proof.",
        "We do not publish complaints or “failed supplier” pages. Disputes remove records from public view; they are not turned into rankings.",
      ],
    },
  ],
  checklist: [
    "Ask suppliers for their Hansala URL early in diligence",
    "Compare named clients in the deck against confirmed records",
    "Treat empty profiles as “no file yet,” not as a red flag by itself",
    "Combine with your usual financial and compliance checks",
  ],
  notThis: [
    "Not a credit bureau or sanctions screener",
    "Not an ESG ratings product",
    "Not a public blacklist",
  ],
  relatedSlugs: [
    "contractor-qualification",
    "references-for-tenders",
    "verified-client-references",
  ],
};
