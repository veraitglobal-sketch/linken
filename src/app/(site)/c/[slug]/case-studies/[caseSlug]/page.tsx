import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyDetail } from "@/components/case-studies/case-study-detail";
import {
  getCaseStudyForPage,
  isCompanyOwnerSlug,
} from "@/features/case-studies/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import { logProfileEvent } from "@/features/analytics/log";
import { parseProfileSource } from "@/features/analytics/sources";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string; caseSlug: string }>;
  searchParams: Promise<{ error?: string; requested?: string; src?: string; via?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, caseSlug } = await params;
  const caseStudy = await getCaseStudyForPage(slug, caseSlug);
  if (!caseStudy) return { title: "Case study not found" };

  const url = `${getSiteUrl()}/c/${slug}/case-studies/${caseStudy.slug}`;

  return {
    title: caseStudy.title,
    description: caseStudy.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: caseStudy.title,
      description: caseStudy.summary,
      url,
    },
  };
}

export default async function CaseStudyPage({ params, searchParams }: Props) {
  const { slug, caseSlug } = await params;
  const { error, requested, src } = await searchParams;
  const [company, caseStudy] = await Promise.all([
    getCompanyForPage(slug),
    getCaseStudyForPage(slug, caseSlug),
  ]);
  if (!company || !caseStudy) notFound();

  const editable = await isCompanyOwnerSlug(slug);
  const siteUrl = getSiteUrl();

  if (!editable && company.claimed !== false) {
    await logProfileEvent(
      company.slug,
      "profile_view",
      parseProfileSource(src),
    );
  }

  const clientConfirmed = caseStudy.clientConfirmation?.status === "confirmed";
  const confirmer = caseStudy.clientConfirmation?.confirmedBy;
  const undisclosed =
    caseStudy.clientConfirmation?.disclosure === "undisclosed";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: caseStudy.title,
    description: caseStudy.summary,
    locationCreated: caseStudy.location,
    datePublished: caseStudy.year,
    author: {
      "@type": "Organization",
      name: company.name,
      url: `${siteUrl}/c/${company.slug}`,
    },
    client_confirmed: clientConfirmed,
    ...(clientConfirmed
      ? {
          additionalProperty: {
            "@type": "PropertyValue",
            name: "client_confirmed",
            value: true,
          },
          ...(!undisclosed && confirmer?.name
            ? {
                about: {
                  "@type": "Organization",
                  name: confirmer.name,
                  ...(confirmer.slug
                    ? { url: `${siteUrl}/c/${confirmer.slug}` }
                    : {}),
                },
              }
            : {}),
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CaseStudyDetail
        company={company}
        caseStudy={caseStudy}
        editable={editable}
        requested={requested === "1"}
        error={error}
      />
    </>
  );
}
