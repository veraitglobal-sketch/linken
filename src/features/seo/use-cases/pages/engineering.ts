import type { UseCasePage } from "@/features/seo/use-cases/types";

export const engineeringRefs: UseCasePage = {
  slug: "engineering-company-references",
  title: "Engineering company references",
  description:
    "Engineering firms: mutual confirmation for clients, partners, and project attribution used in bids and diligence.",
  eyebrow: "Engineering",
  headline: "Engineering references without self-reported logos",
  lede:
    "Engineering proposals stack logos, delivery partners, and project sheets. Hansala records which of those relationships the other company confirmed — so a capability statement can point to a living source.",
  audience:
    "Civil, structural, MEP, and specialist engineering firms that bid with partners and need confirmation that survives partner changes.",
  sections: [
    {
      heading: "Partners matter as much as clients",
      paragraphs: [
        "Many engineering wins are joint. Confirmed partners show the collaboration graph; confirmed clients show who bought the work.",
        "Both require the other side. A pending partner invite never appears on the public profile or in embeds.",
      ],
    },
    {
      heading: "Technical credibility vs commercial confirmation",
      paragraphs: [
        "Hansala does not certify calculations, codes, or PE stamps. It confirms commercial relationships and optional project attribution.",
        "Keep technical annexes in your QMS; keep mutual commercial proof on Hansala.",
      ],
    },
    {
      heading: "For owner’s engineers reviewing firms",
      paragraphs: [
        "Ask for the Hansala URL alongside ISO and insurance. Check that cited partners match confirmed links.",
        "Treat missing history as “no file yet” for newer firms — not as an automatic fail.",
      ],
    },
  ],
  checklist: [
    "Verify the domain that matches your public website",
    "Confirm recurring delivery partners you name in bids",
    "Publish project pages only with accurate scope and location",
    "Deep-link case studies in technical proposals when clients allow",
  ],
  notThis: [
    "Not an engineering license registry",
    "Not a design calculation archive",
    "Not a public incident or failure database",
  ],
  relatedSlugs: [
    "architecture-firm-references",
    "contractor-qualification",
    "verified-client-references",
  ],
};
