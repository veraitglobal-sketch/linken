import { absoluteUrl, companyPath } from "@/features/seo/paths";

type OrgLd = Record<string, unknown>;

/** Profile page named for the company — Google requires mainEntity.name. */
export function buildCompanyWebPageLd(input: {
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  siteUrl: string;
  organization: OrgLd;
}) {
  const site = input.siteUrl.replace(/\/$/, "");
  const url = absoluteUrl(input.siteUrl, companyPath(input.slug));
  const desc = (input.description || input.tagline || "").trim();
  const { ["@context"]: _ctx, ...entity } = input.organization;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    headline: input.name,
    ...(desc ? { description: desc } : {}),
    isPartOf: { "@id": `${site}/#website` },
    about: { "@id": `${url}#organization` },
    mainEntity: entity,
  };
}
