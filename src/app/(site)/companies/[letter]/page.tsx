import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { CompanyDirectoryHero } from "@/components/seo/company-directory-hero";
import { CompanyDirectoryList } from "@/components/seo/company-directory-list";
import { buildDirectoryItemListLd } from "@/features/seo/directory-ld";
import {
  directoryLetterSlug,
  groupDirectoryByLetter,
  parseDirectoryLetterParam,
} from "@/features/seo/directory-group";
import { listDirectoryCompanies } from "@/features/seo/directory-queries";
import { getSiteUrl } from "@/lib/site";

type Props = { params: Promise<{ letter: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const groups = groupDirectoryByLetter(await listDirectoryCompanies());
    return groups.map((g) => ({ letter: directoryLetterSlug(g.letter) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const letter = parseDirectoryLetterParam((await params).letter);
  if (!letter) return { title: "Company directory" };
  const path = `/companies/${directoryLetterSlug(letter)}`;
  return {
    title: `Companies · ${letter}`,
    description: `Companies on Hansala whose name starts with ${letter}.`,
    alternates: { canonical: path },
  };
}

export default async function CompaniesLetterPage({ params }: Props) {
  const letter = parseDirectoryLetterParam((await params).letter);
  if (!letter) notFound();

  const rows = await listDirectoryCompanies();
  const groups = groupDirectoryByLetter(rows);
  const group = groups.find((g) => g.letter === letter);
  if (!group || group.rows.length === 0) notFound();

  const siteUrl = getSiteUrl();
  const slug = directoryLetterSlug(letter);
  const pageUrl = `${siteUrl.replace(/\/$/, "")}/companies/${slug}`;

  return (
    <div className="home-wash bg-wash">
      <JsonLd
        data={buildDirectoryItemListLd({
          siteUrl,
          pageUrl,
          companies: group.rows,
        })}
      />
      <CompanyDirectoryHero
        title={`Companies · ${letter}`}
        total={group.rows.length}
        crumb={{ href: "/companies", label: "All letters" }}
      />
      <div className="pt-12">
        <CompanyDirectoryList
          companies={group.rows}
          letter={letter}
          letters={groups}
        />
      </div>
    </div>
  );
}
