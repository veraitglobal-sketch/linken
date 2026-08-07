import {
  absoluteUrl,
  companyCaseStudyPath,
  companyPath,
} from "@/features/seo/paths";

type CaseStudyLdInput = {
  title: string;
  summary: string;
  year?: string;
  location?: string;
  coverImageUrl?: string | null;
  companyName: string;
  companySlug: string;
  caseSlug: string;
  siteUrl: string;
  clientConfirmed: boolean;
  clientName?: string | null;
  clientSlug?: string | null;
  undisclosed?: boolean;
};

export function buildCaseStudyArticleLd(input: CaseStudyLdInput) {
  const url = absoluteUrl(
    input.siteUrl,
    companyCaseStudyPath(input.companySlug, input.caseSlug),
  );
  const companyUrl = absoluteUrl(
    input.siteUrl,
    companyPath(input.companySlug),
  );

  const about =
    input.clientConfirmed && !input.undisclosed && input.clientName
      ? {
          about: {
            "@type": "Organization",
            name: input.clientName,
            ...(input.clientSlug
              ? {
                  url: absoluteUrl(
                    input.siteUrl,
                    companyPath(input.clientSlug),
                  ),
                }
              : {}),
          },
        }
      : {};

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.summary,
    mainEntityOfPage: url,
    url,
    ...(input.year ? { datePublished: input.year } : {}),
    ...(input.location ? { contentLocation: input.location } : {}),
    ...(input.coverImageUrl
      ? { image: absoluteUrl(input.siteUrl, input.coverImageUrl) }
      : {}),
    author: {
      "@type": "Organization",
      name: input.companyName,
      url: companyUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Hansala",
      url: absoluteUrl(input.siteUrl, "/"),
    },
    ...about,
    ...(input.clientConfirmed
      ? {
          additionalProperty: {
            "@type": "PropertyValue",
            name: "client_confirmed",
            value: true,
            description:
              "The named client confirmed this case study on Hansala.",
          },
        }
      : {}),
  };
}

export function buildCaseStudyBreadcrumbLd(input: {
  companyName: string;
  companySlug: string;
  caseTitle: string;
  caseSlug: string;
  siteUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Hansala",
        item: absoluteUrl(input.siteUrl, "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: input.companyName,
        item: absoluteUrl(input.siteUrl, companyPath(input.companySlug)),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: input.caseTitle,
        item: absoluteUrl(
          input.siteUrl,
          companyCaseStudyPath(input.companySlug, input.caseSlug),
        ),
      },
    ],
  };
}
