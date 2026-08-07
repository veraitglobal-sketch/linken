import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { UseCaseView } from "@/components/seo/use-case-view";
import {
  getUseCase,
  listUseCaseSlugs,
} from "@/features/seo/use-cases/catalog";
import { absoluteUrl } from "@/features/seo/paths";
import { getSiteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listUseCaseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getUseCase(slug);
  if (!page) return { title: "Not found", robots: { index: false } };
  const url = absoluteUrl(getSiteUrl(), `/use-cases/${page.slug}`);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${page.title} · Hansala`,
      description: page.description,
      url,
      type: "article",
    },
  };
}

export default async function UseCasePage({ params }: Props) {
  const { slug } = await params;
  const page = getUseCase(slug);
  if (!page) notFound();

  const siteUrl = getSiteUrl();
  const url = absoluteUrl(siteUrl, `/use-cases/${page.slug}`);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.headline,
    description: page.description,
    mainEntityOfPage: url,
    url,
    author: {
      "@type": "Organization",
      name: "Hansala",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Hansala",
      url: siteUrl,
    },
  };

  return (
    <>
      <JsonLd data={articleLd} />
      <UseCaseView page={page} />
    </>
  );
}
