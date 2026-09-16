import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RankingScreen } from "@/app/(site)/best/[category]/page";
import { canonicalCategorySlug } from "@/features/categories/taxonomy";
import { countryByCode } from "@/features/geo/countries";
import { getRankedCountries, getRanking } from "@/features/ranking/queries";

type Props = {
  params: Promise<{ category: string; country: string }>;
  searchParams: Promise<{ city?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, country } = await params;
  const slug = canonicalCategorySlug(category);
  const iso = countryByCode(country);
  const list = slug && iso ? await getRanking({ categorySlug: slug, countryCode: iso.code }) : null;
  if (!list || !iso) return { title: "Not found" };
  return {
    title: `Confirmed ${list.categoryName.toLowerCase()} companies in ${iso.name}`,
    description: `${list.total} ${list.categoryName.toLowerCase()} companies in ${iso.name} with work confirmed by the companies they worked for.`,
    alternates: { canonical: `/best/${list.categorySlug}/${iso.code.toLowerCase()}` },
  };
}

export default async function CountryRankingPage({ params, searchParams }: Props) {
  const { category, country } = await params;
  const { city } = await searchParams;
  const slug = canonicalCategorySlug(category);
  const iso = countryByCode(country);
  if (!slug || !iso) notFound();
  if (slug !== category) redirect(`/best/${slug}/${country}`);

  const [list, countries] = await Promise.all([
    getRanking({ categorySlug: slug, countryCode: iso.code, city: city ?? null }),
    getRankedCountries(slug),
  ]);
  if (!list) notFound();

  return (
    <RankingScreen
      eyebrow={iso.name}
      list={list}
      countries={countries}
      activeCountry={iso.code}
      city={city ?? null}
    />
  );
}
