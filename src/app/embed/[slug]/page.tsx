import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/ui/logo-mark";
import { getCaseStudiesForCompany } from "@/data/mock/case-studies";
import { getCompanyBySlug } from "@/data/mock/companies";
import { getPartnersForCompany } from "@/data/mock/partners";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  return {
    title: company ? `${company.name} · Verified on Linken` : "Linken badge",
    robots: { index: false, follow: true },
  };
}

export default async function EmbedBadgePage({ params }: Props) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) notFound();

  const siteUrl = getSiteUrl();
  const profileUrl = `${siteUrl}/c/${company.slug}`;
  const partnerCount = getPartnersForCompany(slug).filter(
    (partner) => partner.status === "accepted",
  ).length;
  const caseStudyCount = getCaseStudiesForCompany(slug).length;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 border border-line bg-white px-4 py-3 no-underline transition-colors hover:bg-paper"
    >
      <LogoMark initials={company.logoInitials} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-ink">{company.name}</p>
          {company.verified ? <Badge tone="success">Verified</Badge> : null}
        </div>
        <p className="mt-0.5 text-[12px] text-muted">
          {partnerCount} verified partner{partnerCount === 1 ? "" : "s"} ·{" "}
          {caseStudyCount} case stud{caseStudyCount === 1 ? "y" : "ies"}
        </p>
      </div>
      <span className="shrink-0 text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
        Linken
      </span>
    </a>
  );
}
