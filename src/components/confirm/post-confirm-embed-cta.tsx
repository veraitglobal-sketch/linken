import Link from "next/link";
import { CopyChip } from "@/components/developers/copy-chip";
import { buildEmbedSnippet } from "@/features/widgets/embed-snippet";
import { getSiteUrl } from "@/lib/site";

type Props = {
  /** Confirmer's Hansala slug when they already have a claimed profile. */
  companySlug?: string | null;
  /** Other company's slug — for the mutual-embed ask. */
  requesterSlug?: string | null;
};

/** Optional next step after case/reference confirm — put proof on your site. */
export function PostConfirmEmbedCta({ companySlug, requesterSlug }: Props) {
  if (!companySlug) return null;
  const siteUrl = getSiteUrl();
  const snippet = buildEmbedSnippet({
    siteUrl,
    slug: companySlug,
    variant: "network",
    theme: "light",
    width: "100%",
    height: 72,
  });

  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-6 sm:px-7">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
        On your website
      </p>
      <h3 className="mt-2 font-display text-[1.2rem] font-semibold tracking-[-0.03em] text-ink">
        Show who confirmed you work with
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        Paste a free network strip on your site
        {requesterSlug ? (
          <>
            . Ask{" "}
            <Link
              href={`/c/${requesterSlug}`}
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              the other company
            </Link>{" "}
            to embed theirs too — mutual proof, both ways.
          </>
        ) : (
          <> — and ask your partner to embed theirs too.</>
        )}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <CopyChip
          value={snippet}
          label="Copy embed code"
          className="inline-flex h-10 items-center px-4 text-[13px]"
        />
        <Link
          href="/dashboard/widgets"
          className="inline-flex h-10 items-center rounded-full border border-line px-4 text-[13px] font-semibold text-ink"
        >
          Open widgets
        </Link>
      </div>
    </div>
  );
}
