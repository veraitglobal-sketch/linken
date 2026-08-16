import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { PublicTestimonial } from "@/features/testimonials/types";
import { cn } from "@/lib/cn";

type Props = {
  item: PublicTestimonial;
  profileUrl: string;
  compact?: boolean;
  featured?: boolean;
  /**
   * The wall card: no quote glyph, body set as reading type, attribution
   * pinned to the bottom behind a monogram.
   *
   * A repeated layout carries itself — an ornament on every card fights the
   * repetition and eats the first line of each one. Pinning the footer squares
   * the cards off so a short quote does not leave a third of its card empty.
   *
   * The other cards set the body as display type: medium weight, `-0.03em`,
   * 1.35 leading. That is right for one quote holding a section on its own and
   * wrong for forty of them stacked — at this density it has to be read, not
   * looked at, so weight, tracking and leading all go back to reading values.
   */
  quiet?: boolean;
};

/** Initials for the monogram — the name already on the record, set as a mark.
 *  Never a photograph: the record carries no likeness and we do not invent one. */
function monogram(item: PublicTestimonial): string {
  const source = item.authorCompany?.name ?? item.authorName;
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Editorial proof card — quiet enough for any host, precise enough for Hansala. */
export function EmbedTestimonialCard({
  item,
  profileUrl,
  compact = false,
  featured = false,
  quiet = false,
}: Props) {
  const published = new Date(item.publishedAt).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "hs-tm-card group w-full no-underline",
        /* Every card is a link and none of them showed a focus ring — 71 of them
           in one wall, all invisible to a keyboard. `currentColor` rather than a
           colour of ours: on a host page the ring has to belong to their palette,
           and the accent is already theirs to set. */
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
        quiet ? "flex h-full flex-col" : "block",
        compact ? "px-0 py-3" : "p-[var(--hs-tm-spacing)]",
        !compact && "border",
      )}
      style={{
        background: compact ? "transparent" : "var(--hs-tm-card-bg)",
        borderColor: compact ? "transparent" : "var(--hs-tm-border)",
        borderWidth: compact ? 0 : "var(--hs-tm-border-w)",
        borderRadius: compact ? 0 : "var(--hs-tm-radius)",
        boxShadow: compact ? "none" : "var(--hs-tm-shadow)",
        color: "var(--hs-tm-text)",
      }}
    >
      {!compact && !quiet ? (
        <span
          aria-hidden
          className="hs-tm-mark block font-display leading-none select-none"
          style={{
            color: "var(--hs-tm-accent)",
            fontSize: featured ? "2.4em" : "1.85em",
            opacity: 0.55,
            marginBottom: "0.15em",
          }}
        >
          “
        </span>
      ) : null}

      <blockquote
        className={cn(
          "hs-tm-body m-0",
          quiet
            ? "text-[1em] leading-[1.55]"
            : "font-display font-medium leading-[1.35] tracking-[-0.03em]",
          !quiet &&
            (featured ? "text-[1.12em]" : compact ? "text-[0.95em]" : "text-[1.02em]"),
        )}
        style={{ color: "var(--hs-tm-text)" }}
      >
        {item.body}
      </blockquote>

      {quiet ? (
        /* Two registers, and the order matters. The person comes first, beside
           their monogram, the way a reader expects an attribution to read. The
           provenance and the mark sit under a hairline in the smallest size on
           the card — present and legible, never competing with the words. They
           are also the two things a host may not remove, so they are given
           their own row rather than tucked into someone else's. */
        /* Laid out in normal flow, deliberately.
         *
         * `ATTRIBUTION_GUARD` forces `display: revert` and `width/height: auto`
         * with `!important` on everything inside `.hs-tm-attribution`, so that a
         * host cannot hide the provenance or the mark. That also means no flex,
         * no grid and no fixed sizes survive in there. The monogram therefore
         * sits outside the guard — it is decoration derived from the name, not
         * the attribution — and the seal is floated rather than flexed.
         *
         * Nothing here truncates. `overflow` is forced visible by the guard, so
         * a `truncate` does not clip, it spills past the card edge. Wrapping is
         * also the right answer on its own terms: the provenance line is the
         * evidence, and evidence that runs long gets another line. */
        <footer className="mt-auto pt-6">
          {/* One block, read top down: who, then what they are, then what is
              behind it. An earlier pass split this into two rows divided by a
              hairline, which gave a card three registers where the body only
              needs to be answered by one. */}
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="grid shrink-0 place-items-center rounded-full font-semibold"
              style={{
                width: "2.3em",
                height: "2.3em",
                /* Neutral, not mint. A wall shows a dozen of these at once, and
                   a dozen mint discs would make the accent the loudest thing on
                   a page that is not ours. Mint is the mark, once, at the right. */
                background: "var(--hs-tm-border)",
                color: "var(--hs-tm-muted)",
              }}
            >
              <span className="text-[0.62em] tracking-[0.02em]">{monogram(item)}</span>
            </span>

            <div className="hs-tm-attribution min-w-0 flex-1">
              <p
                className="m-0 text-[0.88em] leading-snug font-semibold tracking-[-0.01em]"
                style={{ color: "var(--hs-tm-text)" }}
              >
                {item.authorName}
              </p>
              {(item.authorRole || item.authorCompany?.name) && (
                <p
                  className="m-0 mt-0.5 text-[0.8em] leading-snug"
                  style={{ color: "var(--hs-tm-muted)" }}
                >
                  {/* Company first, then role — "Stripe, CEO", not "CEO · Stripe".
                      The company is the part a reader is placing; the role
                      qualifies it. The other layouts keep the older order, so
                      this stays inside `quiet` rather than changing every
                      shipped embed under its owner. */}
                  {[item.authorCompany?.name, item.authorRole]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Full width, under the block rather than beside the monogram.
              Indented next to it the line had roughly 250px and wrapped to two,
              which turned a two-line attribution into a four-line one. Out here
              it has the whole card and sets on one.

              The date is gone with it. `provenanceLine` is the evidence and is
              non-negotiable; the month a record was published is neither, and it
              was the thing tipping the line over the edge. */}
          {item.provenanceLine ? (
            <p
              /* Set to recede. A real provenance line runs to about sixty
                 characters — "Confirmed by the client · nordwerk-holding.com ·
                 domain verified" is what `provenance.ts` generates, not example
                 verbosity — and at 346px it takes two lines however it is set.
                 So it is allowed to take two, quietly: smaller than the role,
                 tighter, and lighter, so the block still reads as name, then
                 company, then a caption. */
              className="hs-tm-attribution hs-tm-seal m-0 mt-2.5 text-[0.64em] leading-[1.45] opacity-80"
              /* When it does take two lines, it must not leave "verified" alone
                 on the second. `pretty` only touches the last lines, so nothing
                 above the break moves. */
              style={{ color: "var(--hs-tm-muted)", textWrap: "pretty" }}
            >
              {/* Inline flow, not flex — this sits inside the guard, which
                  reverts `display` and would drop a flex row to a block. */}
              <VerifiedBadge
                size={12}
                title="Confirmed on Hansala"
                className="mr-1 inline-block align-[-0.15em]"
              />
              {item.provenanceLine}
            </p>
          ) : null}
        </footer>
      ) : (
      <footer className={cn("hs-tm-attribution mt-4", compact && "mt-2.5")}>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p
              className="m-0 text-[0.82em] font-semibold tracking-[-0.01em]"
              style={{ color: "var(--hs-tm-text)" }}
            >
              {item.authorName}
            </p>
            {(item.authorRole || item.authorCompany?.name) && (
              <p
                className="m-0 mt-0.5 truncate text-[0.75em] leading-snug"
                style={{ color: "var(--hs-tm-muted)" }}
              >
                {[item.authorRole, item.authorCompany?.name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {(item.provenanceLine || item.publishedAt) && (
              <p
                className="m-0 mt-1.5 text-[0.7em] leading-relaxed"
                style={{ color: "var(--hs-tm-muted)" }}
              >
                {item.provenanceLine}
                {item.provenanceLine && item.publishedAt ? (
                  <span className="mx-1 opacity-40">·</span>
                ) : null}
                {item.publishedAt ? (
                  <time dateTime={item.publishedAt}>{published}</time>
                ) : null}
              </p>
            )}
          </div>
          <span
            className="hs-tm-seal shrink-0 text-[9px] font-bold tracking-[0.14em] uppercase"
            style={{ color: "var(--hs-tm-accent)" }}
          >
            Hansala
          </span>
        </div>
      </footer>
      )}
    </a>
  );
}
