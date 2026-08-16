import { EmbedHansalaSeal } from "@/components/embed/embed-linken-seal";
import { NetworkMark } from "@/components/marketing/network-mark";

/**
 * What the recipient sees when the link lands.
 *
 * This section is about sending one link, and the visual was a graph of three
 * stock photographs you could drag around — a toy that demonstrated nothing
 * about sharing, with generic `story-*.jpg` faces standing in for companies.
 *
 * The share moment has a real artifact: the unfurl. Every chat client, inbox
 * and social post renders it from `/c/[slug]/opengraph-image.tsx` (1200×630),
 * and that generator prints the confirmed partner and client counts. This is
 * that card, at the proportions it actually unfurls in.
 *
 * The record is the one the repo documents as real — Vera IT, one confirmed
 * partner. A number we cannot prove has no business on a page about proof.
 */
export function LinkPreviewCard() {
  return (
    <div className="w-full max-w-[520px]">
      {/* The link, as pasted. */}
      <div className="flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2.5 shadow-[0_1px_2px_rgba(8,20,18,0.04)]">
        <NetworkMark size={14} animate={false} />
        <span className="truncate font-mono text-[12.5px] text-ink-soft">
          hansala.com/c/verait
        </span>
      </div>

      {/* The unfurl, at the 1200×630 ratio the OG route renders. */}
      <div className="mt-3 overflow-hidden rounded-card border border-line bg-surface shadow-[0_1px_2px_rgba(8,20,18,0.04),0_18px_44px_-18px_rgba(8,20,18,0.22)]">
        <div className="relative aspect-[1200/630] bg-navy">
          <div
            className="absolute inset-0 bg-[url('/images/plate-ink-2.webp')] bg-cover bg-center opacity-80"
            aria-hidden
          />
          <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
            <div className="flex items-center gap-2.5">
              <NetworkMark size={16} animate={false} className="text-blue-soft" />
              <span className="text-[11px] font-semibold tracking-[0.16em] text-on-navy-muted uppercase">
                Confirmed record
              </span>
            </div>

            <div>
              <p className="font-display text-[26px] leading-none font-medium tracking-[-0.035em] text-on-navy sm:text-[30px]">
                Vera IT
              </p>
              <p className="mt-2.5 text-[13px] text-on-navy-soft">
                verait.de · Domain verified
              </p>
              <p className="mt-1 text-[13px] text-on-navy-muted">
                1 confirmed partner
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3.5">
          <span className="truncate text-[12px] text-muted">hansala.com</span>
          <EmbedHansalaSeal theme="light" />
        </div>
      </div>
    </div>
  );
}
