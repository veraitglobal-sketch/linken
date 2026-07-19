import { NextResponse } from "next/server";
import { getCaseStudiesForCompany } from "@/data/mock/case-studies";
import { getCompanyBySlug } from "@/data/mock/companies";
import { getPartnersForCompany } from "@/data/mock/partners";
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
  const company = getCompanyBySlug(slug);

  if (!company) {
    return NextResponse.json(
      { error: "Company not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const siteUrl = getSiteUrl();
  const confirmedPartners = getPartnersForCompany(slug).filter(
    (partner) => partner.status === "accepted",
  );

  return NextResponse.json(
    {
      name: company.name,
      slug: company.slug,
      verified: company.verified,
      logoInitials: company.logoInitials,
      city: company.city,
      country: company.country,
      partnerCount: confirmedPartners.length,
      caseStudyCount: getCaseStudiesForCompany(slug).length,
      profileUrl: `${siteUrl}/c/${company.slug}`,
      embedUrl: `${siteUrl}/embed/${company.slug}`,
    },
    { headers: CORS_HEADERS },
  );
}
