import { notFound, permanentRedirect } from "next/navigation";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { getCompanyForPage } from "@/features/companies/queries";
import { companyProfilePath } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

/** Short URL: hansala.com/{slug} → /c/{slug} */
export default async function ShortCompanyProfilePage({ params }: Props) {
  const { slug } = await params;
  // Reserved metadata paths must never resolve as company slugs.
  if (
    slug === "sitemap.xml" ||
    slug === "robots.txt" ||
    slug === "llms.txt"
  ) {
    notFound();
  }
  const company = await getCompanyForPage(slug);
  if (company) permanentRedirect(companyProfilePath(company.slug));

  const redirectSlug = await resolveCompanySlugRedirect(slug);
  if (redirectSlug) permanentRedirect(companyProfilePath(redirectSlug));

  notFound();
}
