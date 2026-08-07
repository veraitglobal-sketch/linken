import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CaseStudyDetail } from "@/components/case-studies/case-study-detail";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getCaseStudyForPage,
  isCompanyOwnerSlug,
} from "@/features/case-studies/queries";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { getCompanyForPage } from "@/features/companies/queries";
import { hasPublishedTestimonialForCase } from "@/features/testimonials/queries";
import { logProfileEvent } from "@/features/analytics/log";
import { parseProfileSource } from "@/features/analytics/sources";
import {
  buildCaseStudyArticleLd,
  buildCaseStudyBreadcrumbLd,
} from "@/features/seo/case-study-json-ld";
import { companyIndexability } from "@/features/seo/indexability";
import { absoluteUrl, companyCaseStudyPath } from "@/features/seo/paths";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string; caseSlug: string }>;
  searchParams: Promise<{
    error?: string;
    requested?: string;
    src?: string;
    via?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, caseSlug } = await params;
  const [company, caseStudy] = await Promise.all([
    getCompanyForPage(slug),
    getCaseStudyForPage(slug, caseSlug),
  ]);
  if (!company || !caseStudy) {
    return {
      title: "Case study not found",
      robots: { index: false, follow: false },
    };
  }

  const clientConfirmed =
    caseStudy.clientConfirmation?.status === "confirmed";
  // Unconfirmed work is owner-only — never indexable.
  if (!clientConfirmed) {
    return {
      title: caseStudy.title,
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = getSiteUrl();
  const url = absoluteUrl(
    siteUrl,
    companyCaseStudyPath(company.slug, caseStudy.slug),
  );
  const { index, follow } = companyIndexability(company);

  return {
    title: caseStudy.title,
    description: caseStudy.summary,
    robots: { index, follow },
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: caseStudy.title,
      description: caseStudy.summary,
      url,
      ...(caseStudy.coverImageUrl
        ? { images: [caseStudy.coverImageUrl] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: caseStudy.title,
      description: caseStudy.summary,
    },
  };
}

export default async function CaseStudyPage({ params, searchParams }: Props) {
  const { slug, caseSlug } = await params;
  const { error, requested, src } = await searchParams;

  const company = await getCompanyForPage(slug);
  if (!company) {
    const redirectSlug = await resolveCompanySlugRedirect(slug);
    if (redirectSlug) {
      permanentRedirect(`/c/${redirectSlug}/case-studies/${caseSlug}`);
    }
    notFound();
  }

  const [caseStudy, editable] = await Promise.all([
    getCaseStudyForPage(company.slug, caseSlug),
    isCompanyOwnerSlug(company.slug),
  ]);
  if (!caseStudy) notFound();

  const clientConfirmed =
    caseStudy.clientConfirmation?.status === "confirmed";
  // Product rule: visitors only see mutually confirmed case studies.
  if (!clientConfirmed && !editable) notFound();

  const hideCompanyQuote = await hasPublishedTestimonialForCase(caseStudy.id);
  const siteUrl = getSiteUrl();

  if (!editable && company.claimed !== false) {
    await logProfileEvent(
      company.slug,
      "profile_view",
      parseProfileSource(src),
    );
  }

  const confirmer = caseStudy.clientConfirmation?.confirmedBy;
  const undisclosed =
    caseStudy.clientConfirmation?.disclosure === "undisclosed";

  const articleLd = buildCaseStudyArticleLd({
    title: caseStudy.title,
    summary: caseStudy.summary,
    year: caseStudy.year,
    location: caseStudy.location,
    coverImageUrl: caseStudy.coverImageUrl,
    companyName: company.name,
    companySlug: company.slug,
    caseSlug: caseStudy.slug,
    siteUrl,
    clientConfirmed,
    clientName: confirmer?.name,
    clientSlug: confirmer?.slug,
    undisclosed,
  });
  const crumbLd = buildCaseStudyBreadcrumbLd({
    companyName: company.name,
    companySlug: company.slug,
    caseTitle: caseStudy.title,
    caseSlug: caseStudy.slug,
    siteUrl,
  });

  return (
    <>
      <JsonLd data={[articleLd, crumbLd]} />
      <CaseStudyDetail
        company={company}
        caseStudy={caseStudy}
        editable={editable}
        requested={requested === "1"}
        error={error}
        hideCompanyQuote={hideCompanyQuote}
      />
    </>
  );
}
