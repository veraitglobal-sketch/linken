import { companyPath } from "@/features/seo/paths";
import type { PartnershipCertificate } from "@/features/certificate/queries";

export function buildPartnershipRecordLd(
  data: PartnershipCertificate,
  recordUrl: string,
  siteUrl: string,
) {
  const org = (slug: string, name: string, category: string, website: string) => ({
    "@type": "Organization",
    name,
    url: `${siteUrl}${companyPath(slug)}`,
    ...(category ? { knowsAbout: category } : {}),
    ...(website ? { sameAs: website } : {}),
  });

  return {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: `Confirmed partnership · ${data.left.name} and ${data.right.name}`,
    url: recordUrl,
    dateCreated: data.confirmedAt,
    description: `${data.left.name} and ${data.right.name} confirmed they work together on Hansala.`,
    about: [
      org(data.left.slug, data.left.name, data.left.category, data.left.website),
      org(
        data.right.slug,
        data.right.name,
        data.right.category,
        data.right.website,
      ),
    ],
  };
}
