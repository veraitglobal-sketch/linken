import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { BookChrome } from "@/components/scheduling/book-chrome";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { getCompanyForPage } from "@/features/companies/queries";
import { getSchedulingForCompanyId } from "@/features/scheduling/queries";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  if (!company) {
    return { title: "Book a call", robots: { index: false, follow: false } };
  }
  const index = company.claimed !== false;
  return {
    title: `Book a call · ${company.name}`,
    description: `Schedule time with ${company.name} on Hansala.`,
    robots: { index, follow: true },
    alternates: { canonical: `${getSiteUrl()}/c/${company.slug}/book` },
  };
}

export default async function CompanyBookPage({ params }: Props) {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  if (!company) {
    const redirectSlug = await resolveCompanySlugRedirect(slug);
    if (redirectSlug) permanentRedirect(`/c/${redirectSlug}/book`);
    notFound();
  }

  const scheduling = await getSchedulingForCompanyId(company.id);
  if (!scheduling.url || !scheduling.provider) {
    permanentRedirect(`/c/${company.slug}`);
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-4 py-8 sm:py-12">
      <p className="mb-4 text-[13px]">
        <Link
          href={`/c/${company.slug}`}
          className="font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          ← {company.name}
        </Link>
      </p>
      <div className="min-h-[70vh] overflow-hidden rounded-[28px] border border-line bg-white/90 shadow-[0_24px_64px_rgba(8,20,18,0.1)] backdrop-blur-xl">
        <BookChrome
          companyName={company.name}
          logoInitials={company.logoInitials}
          logoUrl={company.logoUrl}
          bookingUrl={scheduling.url}
          provider={scheduling.provider}
          label={scheduling.label}
          fill
        />
      </div>
    </main>
  );
}
