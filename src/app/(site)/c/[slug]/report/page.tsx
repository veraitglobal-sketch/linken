import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { getCompanyForPage } from "@/features/companies/queries";
import { companyPath } from "@/features/seo/paths";
import { getLegalCompany } from "@/lib/legal/company";
import { getSiteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  if (!company) return { title: "Report", robots: { index: false, follow: false } };
  return {
    title: `Report · ${company.name}`,
    description: `Report incorrect information on the ${company.name} Hansala profile.`,
    robots: { index: false, follow: true },
    alternates: {
      canonical: `${getSiteUrl()}/c/${company.slug}/report`,
    },
  };
}

export default async function CompanyReportPage({ params }: Props) {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  if (!company) {
    const redirectSlug = await resolveCompanySlugRedirect(slug);
    if (redirectSlug) permanentRedirect(`/c/${redirectSlug}/report`);
    notFound();
  }

  const legal = getLegalCompany();
  const profileUrl = `${getSiteUrl()}${companyPath(company.slug)}`;
  const subject = encodeURIComponent(
    `Incorrect information: ${company.name} (${company.slug})`,
  );
  const body = encodeURIComponent(
    [
      `Profile: ${profileUrl}`,
      `Company: ${company.name}`,
      "",
      "What is incorrect:",
      "",
      "What should be corrected (facts only):",
      "",
      "Your relationship to this company (optional):",
      "",
    ].join("\n"),
  );
  const mailto = `mailto:${legal.contactEmail}?subject=${subject}&body=${body}`;

  return (
    <main className="mx-auto max-w-xl px-4 py-16 sm:py-20">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
        Report
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,2.4rem)] font-medium tracking-[-0.035em] text-ink">
        Report incorrect information
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        Use this for factual errors on{" "}
        <Link
          href={companyPath(company.slug)}
          className="font-medium text-ink underline-offset-2 hover:underline"
        >
          {company.name}
        </Link>
        . We hide disputed public records while we review — visitors never see a
        “disputed” label. Pending or private claims are not shown on public
        profiles.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-[14px] text-ink-soft">
        <li>Company name, location, website, or services that are wrong</li>
        <li>A confirmed relationship that should not be public</li>
        <li>A case study or reference attributed incorrectly</li>
      </ul>
      <p className="mt-6 text-[14px] text-ink-soft">
        Email{" "}
        <a href={mailto} className="font-medium text-ink underline-offset-2 hover:underline">
          {legal.contactEmail}
        </a>{" "}
        with the facts. Do not send passwords, claim tokens, or unpublished
        drafts.
      </p>
      <p className="mt-8 text-[13px]">
        <Link
          href={companyPath(company.slug)}
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          ← Back to profile
        </Link>
      </p>
    </main>
  );
}
