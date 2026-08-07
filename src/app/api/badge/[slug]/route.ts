import { NextResponse } from "next/server";
import { getCaseStudiesForCompany } from "@/features/case-studies/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import { getPartnersForCompany } from "@/features/partners/public-queries";
import { getSiteUrl } from "@/lib/site";

type Params = {
  params: Promise<{ slug: string }>;
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const company = await getCompanyForPage(slug.trim());

  if (!company) {
    return NextResponse.json(
      { error: "Company not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const siteUrl = getSiteUrl();
  const [partners, caseStudies] = await Promise.all([
    getPartnersForCompany(company.id),
    getCaseStudiesForCompany(company.id, { confirmedOnly: true }),
  ]);

  return NextResponse.json(
    {
      name: company.name,
      slug: company.slug,
      verified: company.verified,
      logoInitials: company.logoInitials,
      city: company.city,
      country: company.country,
      partnerCount: partners.length,
      caseStudyCount: caseStudies.length,
      profileUrl: `${siteUrl}/c/${company.slug}`,
      embedUrl: `${siteUrl}/embed/${company.slug}`,
    },
    { headers: CORS_HEADERS },
  );
}
