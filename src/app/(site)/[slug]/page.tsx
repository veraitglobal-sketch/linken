import { notFound, permanentRedirect } from "next/navigation";
import { isReservedCompanySlug } from "@/features/companies/reserved-slugs";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { getCompanyForPage } from "@/features/companies/queries";
import { companyProfilePath } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

/** Short URL: hansala.com/{slug} → /c/{slug} */
export default async function ShortCompanyProfilePage({ params }: Props) {
  const { slug } = await params;
  if (isReservedCompanySlug(slug)) notFound();

  const company = await getCompanyForPage(slug);
  if (company) permanentRedirect(companyProfilePath(company.slug));

  const redirectSlug = await resolveCompanySlugRedirect(slug);
  if (redirectSlug) permanentRedirect(companyProfilePath(redirectSlug));

  notFound();
}
