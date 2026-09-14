import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CertificateDocument } from "@/components/certificate/certificate-document";
import { CertificateToolbar } from "@/components/certificate/certificate-toolbar";
import { JsonLd } from "@/components/seo/json-ld";
import { partnershipAnnouncement } from "@/features/certificate/copy";
import { buildPartnershipRecordLd } from "@/features/certificate/json-ld";
import { getPartnershipCertificate } from "@/features/certificate/queries";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import {
  canonicalCompanyWithPath,
  companyWithPath,
} from "@/features/seo/paths";
import { qrDataUri } from "@/lib/qr";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string; partnerSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, partnerSlug } = await params;
  const data = await getPartnershipCertificate(slug, partnerSlug);
  if (!data) {
    return {
      title: "Partnership record not found",
      robots: { index: false, follow: false },
    };
  }
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${canonicalCompanyWithPath(data.left.slug, data.right.slug)}`;
  const industries = [data.left.category, data.right.category]
    .filter(Boolean)
    .join(" · ");
  const title = `${data.left.name} and ${data.right.name}`;
  const description = `Confirmed partnership on Hansala. ${industries}. Both companies accepted.`;
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: "Hansala",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PartnershipCertificatePage({ params }: Props) {
  const { slug, partnerSlug } = await params;
  const data = await getPartnershipCertificate(slug, partnerSlug);
  if (!data) {
    const left = await resolveCompanySlugRedirect(slug);
    const right = await resolveCompanySlugRedirect(partnerSlug);
    if (left || right) {
      permanentRedirect(companyWithPath(left || slug, right || partnerSlug));
    }
    notFound();
  }

  const siteUrl = getSiteUrl();
  const recordPath = companyWithPath(data.left.slug, data.right.slug);
  const recordUrl = `${siteUrl}${recordPath}`;
  const qr = await qrDataUri(`${recordUrl}?src=qr`);
  const announcement = partnershipAnnouncement(
    data.left.name,
    data.right.name,
    data.confirmedAt,
  );

  return (
    <div className="pb-16">
      <JsonLd data={buildPartnershipRecordLd(data, recordUrl, siteUrl)} />
      <CertificateToolbar
        announcement={announcement}
        recordUrl={recordUrl}
        left={data.left}
        right={data.right}
      />
      <div className="mt-4 px-2 sm:px-4">
        <CertificateDocument
          data={data}
          recordUrl={recordUrl}
          qrDataUri={qr}
        />
      </div>
    </div>
  );
}
