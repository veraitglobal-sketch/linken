import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OnePagerDocument } from "@/components/one-pager/one-pager-document";
import { PrintButton } from "@/components/one-pager/print-button";
import { logProfileEvent } from "@/features/analytics/log";
import { isCompanyOwnerSlug } from "@/features/case-studies/queries";
import { getOnePagerData } from "@/features/one-pager/queries";
import { qrDataUri } from "@/lib/qr";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getOnePagerData(slug);
  if (!data) return { title: "One-pager not found" };
  return {
    title: `${data.company.name} · Verified one-pager`,
    description: `Confirmed partners, references, and work for ${data.company.name} on Linken.`,
    robots: { index: false, follow: true },
  };
}

export default async function OnePagerPage({ params }: Props) {
  const { slug } = await params;
  const data = await getOnePagerData(slug);
  if (!data) notFound();

  const isOwner = await isCompanyOwnerSlug(slug);
  if (!isOwner) {
    await logProfileEvent(data.company.slug, "one_pager_view", "one_pager");
  }

  const siteUrl = getSiteUrl();
  const profileUrl = `${siteUrl}/c/${data.company.slug}?src=qr`;
  const openProfileHref = `/c/${data.company.slug}?src=one_pager`;
  const qr = await qrDataUri(profileUrl);

  return (
    <div className="pb-16">
      <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 pt-6 print:hidden sm:px-0">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1a5c51] uppercase">
            Linken
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Attach this with every proposal — scan to verify.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrintButton />
          <Link
            href={openProfileHref}
            className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-4 text-[13px] font-medium text-ink"
          >
            Open profile
          </Link>
        </div>
      </div>

      <div className="mt-4 px-2 sm:px-4">
        <OnePagerDocument
          data={data}
          profileUrl={`${siteUrl}/c/${data.company.slug}`}
          qrDataUri={qr}
        />
      </div>
    </div>
  );
}
