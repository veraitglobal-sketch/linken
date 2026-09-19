import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { CompanyDirectoryHero } from "@/components/seo/company-directory-hero";
import { CompanyDirectoryLetters } from "@/components/seo/company-directory-letters";
import { buildDirectoryLetterListLd } from "@/features/seo/directory-ld";
import { groupDirectoryByLetter } from "@/features/seo/directory-group";
import { listDirectoryCompanies } from "@/features/seo/directory-queries";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Company directory",
  description:
    "Companies on Hansala by name. A profile lists a partner only after both companies confirmed it.",
  alternates: { canonical: "/companies" },
};

export default async function CompaniesDirectoryPage() {
  const rows = await listDirectoryCompanies();
  const groups = groupDirectoryByLetter(rows);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl.replace(/\/$/, "")}/companies`;

  return (
    <div className="home-wash bg-wash">
      <JsonLd
        data={buildDirectoryLetterListLd({ siteUrl, pageUrl, groups })}
      />
      <CompanyDirectoryHero title="Companies, by name." total={rows.length} />
      <div className="pt-12">
        <CompanyDirectoryLetters groups={groups} />
      </div>
    </div>
  );
}
