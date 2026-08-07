import type { UseCasePage } from "@/features/seo/use-cases/types";

export const projectPortfolio: UseCasePage = {
  slug: "verified-project-portfolio",
  title: "Verified project portfolio",
  description:
    "Case studies and projects that stay public with client confirmation — a portfolio buyers can open and check.",
  eyebrow: "Project portfolio",
  headline: "A portfolio with a confirmation trail",
  lede:
    "Most portfolios are authored by the seller. Hansala case studies can carry a client confirmation when the other company accepts — so a project page is more than a self-written story.",
  audience:
    "Studios, agencies, and contractors who need project pages that survive procurement scrutiny and partner checks.",
  sections: [
    {
      heading: "Case studies vs claims",
      paragraphs: [
        "You still write the narrative — challenge, process, outcome. What buyers care about is whether the client stood behind the attribution.",
        "When a client confirms, the public page can show that confirmation as a plain fact. When they have not, you do not fake a seal.",
      ],
    },
    {
      heading: "Keeping the portfolio honest",
      paragraphs: [
        "Author fields on testimonials stay locked to the author. Receiving companies cannot rewrite a quote to sound better.",
        "Cover photos and metrics should be real. If a figure is not on record, leave it out — empty is better than invented.",
      ],
    },
    {
      heading: "Distribution without republishing",
      paragraphs: [
        "One company URL holds profile, confirmed partners, references, and projects. Embeds and one-pagers pull from the same confirmed graph.",
        "When a new project is confirmed, the public record updates — your paste-once embed does not need a redesign.",
      ],
    },
  ],
  checklist: [
    "Publish case studies with accurate scope and location",
    "Request client confirmation where disclosure allows",
    "Link projects from proposals instead of attaching outdated PDFs",
    "Use embeds only after you have at least one confirmed record",
  ],
  notThis: [
    "Not a stock photo gallery of “typical clients”",
    "Not an awards directory",
    "Not automatic SEO pages for every industry keyword",
  ],
  relatedSlugs: [
    "agency-case-study-verification",
    "architecture-firm-references",
    "verified-client-references",
  ],
};
