import type { UseCasePage } from "@/features/seo/use-cases/types";

export const clientReferences: UseCasePage = {
  slug: "verified-client-references",
  title: "Verified client references",
  description:
    "Publish client relationships only after the client confirms them — a reference list procurement and partners can trust.",
  eyebrow: "Client references",
  headline: "References the client actually confirmed",
  lede:
    "A logo wall is a claim. A Hansala reference is a mutual record: the provider lists the engagement, the client confirms it, and only then does it appear on the public profile.",
  audience:
    "Service firms that need credible client lists for RFPs, websites, and partner diligence — without inventing names or waiting for PDF letters.",
  sections: [
    {
      heading: "What “confirmed” means here",
      paragraphs: [
        "Confirmed means both companies acted on Hansala. The provider cannot mark a client as confirmed unilaterally. Pending invitations stay private until the other side accepts.",
        "Visitors never see a half-finished claim. That is the product rule the whole network rests on — not a marketing flourish.",
      ],
    },
    {
      heading: "How teams use confirmed references",
      paragraphs: [
        "Attach your public Hansala profile to an RFP response. Reviewers can open the live record instead of chasing stale PDFs.",
        "Embed a reference strip on your site so updates appear when a new client confirms — without republishing your marketing site.",
        "Share a single link in partner diligence. Domain verification (when present) proves who controls the business domain; confirmed references prove who confirmed the work.",
      ],
    },
    {
      heading: "What stays off the page",
      paragraphs: [
        "Pending invitations, declined requests, and disputes never appear as public negatives. A dispute removes the record from view while it is reviewed privately.",
        "Hansala does not invent clients, ratings, or “top vendor” badges. Empty sections are omitted — not padded with placeholders.",
      ],
    },
  ],
  checklist: [
    "Claim and verify your company domain when you can",
    "Invite real clients with a clear engagement description",
    "Publish only after confirmation — never screenshot pending states",
    "Link the public profile from proposals and your website",
  ],
  notThis: [
    "Not a review site or star ratings",
    "Not a paid “verified client” badge for sale",
    "Not a substitute for contractual NDAs — undisclosed clients stay unnamed when disclosure rules require it",
  ],
  relatedSlugs: [
    "references-for-tenders",
    "verified-project-portfolio",
    "supplier-verification",
  ],
};
