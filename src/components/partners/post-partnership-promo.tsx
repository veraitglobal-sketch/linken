import Link from "next/link";
import { buildEmbedSnippet } from "@/features/widgets/embed-snippet";
import { companyWithPath } from "@/features/seo/paths";
import { CopyChip } from "@/components/developers/copy-chip";

type Props = {
  companySlug: string;
  companyName: string;
  siteUrl: string;
  /** Optional partner just confirmed — deep-link the pair record. */
  partnerSlug?: string | null;
};

/**
 * After a partnership confirms: share the pair page and put proof on your site.
 */
export function PostPartnershipPromo({
  companySlug,
  companyName,
  siteUrl,
  partnerSlug,
}: Props) {
  const recordUrl = partnerSlug
    ? `${siteUrl}${companyWithPath(companySlug, partnerSlug)}`
    : `${siteUrl}/c/${companySlug}`;
  const networkSnippet = buildEmbedSnippet({
    siteUrl,
    slug: companySlug,
    variant: "network",
    theme: "light",
    width: "100%",
    height: 72,
  });
  const markSnippet = buildEmbedSnippet({
    siteUrl,
    slug: companySlug,
    variant: "micro",
    theme: "light",
    width: "100%",
  });

  return (
    <div className="mx-auto mt-4 max-w-[1280px] px-4 sm:px-[18px]">
      <div className="rounded-[24px] bg-lime-soft px-5 py-5 ring-1 ring-lime sm:px-6">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-navy uppercase">
          Partnership confirmed
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">
          The link is live. Share the record, then put confirmed partners on{" "}
          {companyName}&apos;s site — and ask them to do the same.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {partnerSlug ? (
            <Link
              href={companyWithPath(companySlug, partnerSlug)}
              className="inline-flex h-10 items-center rounded-full bg-navy px-4 text-[13px] font-semibold text-on-navy"
            >
              Open shared record
            </Link>
          ) : null}
          <CopyChip
            value={recordUrl}
            label="Copy record link"
            className="inline-flex h-10 items-center px-4 text-[13px]"
          />
          <CopyChip
            value={networkSnippet}
            label="Copy network embed"
            className="inline-flex h-10 items-center px-4 text-[13px]"
          />
          <CopyChip
            value={markSnippet}
            label="Copy Verified mark"
            className="inline-flex h-10 items-center px-4 text-[13px]"
          />
          <Link
            href="/dashboard/widgets"
            className="inline-flex h-10 items-center rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-ink"
          >
            Widget studio
          </Link>
        </div>
      </div>
    </div>
  );
}
