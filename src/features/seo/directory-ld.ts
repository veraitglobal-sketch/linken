import { companyPath } from "@/features/seo/paths";
import {
  directoryLetterSlug,
  type DirectoryLetterGroup,
} from "@/features/seo/directory-group";
import type { DirectoryCompany } from "@/features/seo/directory-queries";

/** Hub: letters as list items, each pointing at /companies/{letter}. */
export function buildDirectoryLetterListLd(input: {
  siteUrl: string;
  pageUrl: string;
  groups: DirectoryLetterGroup[];
}) {
  const site = input.siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Companies on Hansala",
    url: input.pageUrl,
    numberOfItems: input.groups.length,
    itemListElement: input.groups.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Companies · ${g.letter}`,
      url: `${site}/companies/${directoryLetterSlug(g.letter)}`,
    })),
  };
}

/** ItemList of company names — Google indexes the name from the list item. */
export function buildDirectoryItemListLd(input: {
  siteUrl: string;
  pageUrl: string;
  companies: DirectoryCompany[];
}) {
  const site = input.siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Companies on Hansala",
    url: input.pageUrl,
    numberOfItems: input.companies.length,
    itemListElement: input.companies.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: `${site}${companyPath(c.slug)}`,
    })),
  };
}
