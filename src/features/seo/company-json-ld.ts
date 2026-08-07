import { absoluteUrl, companyPath } from "@/features/seo/paths";

type CompanyLdInput = {
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  website?: string;
  logoUrl?: string | null;
  city?: string;
  country?: string;
  category?: string;
  services?: string[];
  verified?: boolean;
  siteUrl: string;
};

function asProfessionalService(category: string, services: string[]): boolean {
  if (services.length > 0) return true;
  const c = category.toLowerCase();
  return (
    c.includes("architect") ||
    c.includes("engineer") ||
    c.includes("agency") ||
    c.includes("consult") ||
    c.includes("contractor") ||
    c.includes("design")
  );
}

export function buildCompanyOrganizationLd(input: CompanyLdInput) {
  const url = absoluteUrl(input.siteUrl, companyPath(input.slug));
  const services = input.services ?? [];
  const types = asProfessionalService(input.category ?? "", services)
    ? (["Organization", "ProfessionalService"] as const)
    : (["Organization"] as const);

  const desc =
    (input.description || input.tagline || "").trim() || undefined;
  const logo = resolveAssetUrl(input.siteUrl, input.logoUrl);

  return {
    "@context": "https://schema.org",
    "@type": types.length === 1 ? types[0] : [...types],
    "@id": `${url}#organization`,
    name: input.name,
    url,
    ...(desc ? { description: desc } : {}),
    ...(input.website?.trim()
      ? { sameAs: [input.website.trim()] }
      : {}),
    ...(logo ? { logo } : {}),
    ...(input.city || input.country
      ? {
          address: {
            "@type": "PostalAddress",
            ...(input.city ? { addressLocality: input.city } : {}),
            ...(input.country ? { addressCountry: input.country } : {}),
          },
        }
      : {}),
    ...(services.length ? { knowsAbout: services } : {}),
    ...(services.length
      ? {
          makesOffer: services.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s },
          })),
        }
      : {}),
    ...(input.verified
      ? {
          additionalProperty: {
            "@type": "PropertyValue",
            name: "domain_verified",
            value: true,
            description:
              "Controls a matching business domain or approved identity proof on Hansala. Not a quality guarantee.",
          },
        }
      : {}),
  };
}

function resolveAssetUrl(siteUrl: string, raw?: string | null) {
  if (!raw?.trim()) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  return absoluteUrl(siteUrl, raw);
}

export function buildCompanyBreadcrumbLd(input: {
  name: string;
  slug: string;
  siteUrl: string;
}) {
  const home = absoluteUrl(input.siteUrl, "/");
  const profile = absoluteUrl(input.siteUrl, companyPath(input.slug));
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Hansala",
        item: home,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: input.name,
        item: profile,
      },
    ],
  };
}
