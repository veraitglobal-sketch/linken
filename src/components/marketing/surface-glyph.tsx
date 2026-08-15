import { cn } from "@/lib/cn";

export type SurfaceGlyphKind =
  | "testimonial"
  | "logos"
  | "mark"
  | "profile"
  | "onepager"
  | "api";

/**
 * One glyph per surface, each drawing its own subject.
 *
 * The carousel first borrowed the Outcomes glyphs, which describe moments
 * rather than things — a card about testimonials showed a record attaching to
 * a proposal. These name what they are: a quote, a wall of logos, the mark, a
 * profile, a printed sheet, an endpoint.
 *
 * Every one still ends in the mark's own vocabulary — two nodes and a link —
 * so six different subjects read as one family, and the link is always the
 * part drawn in `--blue`: the confirmation is the constant.
 *
 * These sit on a white badge over a dark plate, so they are ink-on-white and
 * static; the animated set lives in `outcome-glyph`.
 */
export function SurfaceGlyph({
  kind,
  className,
}: {
  kind: SurfaceGlyphKind;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {kind === "testimonial" ? <Testimonial /> : null}
      {kind === "logos" ? <Logos /> : null}
      {kind === "mark" ? <Mark /> : null}
      {kind === "profile" ? <Profile /> : null}
      {kind === "onepager" ? <OnePager /> : null}
      {kind === "api" ? <Api /> : null}
    </svg>
  );
}

/** A quotation, and the link that makes it a record. */
function Testimonial() {
  return (
    <g>
      <path
        d="M18 20c-3.4 0-6 2.6-6 6s2.6 6 6 6c0 4-2.4 6.6-6 7.6M36 20c-3.4 0-6 2.6-6 6s2.6 6 6 6c0 4-2.4 6.6-6 7.6"
        className="stroke-ink"
        strokeWidth={2.4}
      />
      <line x1="22" y1="50" x2="42" y2="50" className="stroke-blue" strokeWidth={2.4} />
      <circle cx="20" cy="50" r="3" className="fill-blue" />
      <circle cx="44" cy="50" r="3" className="fill-blue" />
    </g>
  );
}

/** A wall of marks — only the ones that confirmed you. */
function Logos() {
  const tiles = [
    { x: 10, y: 14, w: 16 },
    { x: 30, y: 14, w: 24 },
    { x: 10, y: 30, w: 24 },
    { x: 38, y: 30, w: 16 },
  ];
  return (
    <g>
      {tiles.map((t) => (
        <rect
          key={`${t.x}-${t.y}`}
          x={t.x}
          y={t.y}
          width={t.w}
          height={10}
          rx={2.5}
          className="stroke-ink"
          strokeWidth={2}
        />
      ))}
      <line x1="22" y1="50" x2="42" y2="50" className="stroke-blue" strokeWidth={2.4} />
      <circle cx="20" cy="50" r="3" className="fill-blue" />
      <circle cx="44" cy="50" r="3" className="fill-blue" />
    </g>
  );
}

/** Domain proof — the mark inside its ring. */
function Mark() {
  return (
    <g>
      <circle cx="32" cy="32" r="20" className="stroke-ink" strokeWidth={2.2} />
      <line x1="24" y1="32" x2="40" y2="32" className="stroke-blue" strokeWidth={2.6} />
      <circle cx="22" cy="32" r="3.4" className="fill-blue" />
      <circle cx="42" cy="32" r="3.4" className="fill-blue" />
    </g>
  );
}

/** What a buyer opens: your profile, with the record on it. */
function Profile() {
  return (
    <g>
      <rect x="10" y="12" width="44" height="40" rx="4" className="stroke-ink" strokeWidth={2} />
      <circle cx="22" cy="26" r="5" className="stroke-ink" strokeWidth={2} />
      <line x1="32" y1="23" x2="46" y2="23" className="stroke-ink" strokeWidth={2} />
      <line x1="32" y1="30" x2="42" y2="30" className="stroke-ink" strokeWidth={2} />
      <line x1="24" y1="42" x2="40" y2="42" className="stroke-blue" strokeWidth={2.4} />
      <circle cx="22" cy="42" r="3" className="fill-blue" />
      <circle cx="42" cy="42" r="3" className="fill-blue" />
    </g>
  );
}

/** A sheet you attach to a bid. */
function OnePager() {
  return (
    <g>
      <path
        d="M14 10h24l12 12v32a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z"
        className="stroke-ink"
        strokeWidth={2}
      />
      <path d="M38 10v12h12" className="stroke-ink" strokeWidth={2} />
      <line x1="20" y1="32" x2="36" y2="32" className="stroke-ink" strokeWidth={2} />
      <line x1="22" y1="44" x2="38" y2="44" className="stroke-blue" strokeWidth={2.4} />
      <circle cx="20" cy="44" r="3" className="fill-blue" />
      <circle cx="40" cy="44" r="3" className="fill-blue" />
    </g>
  );
}

/** One endpoint, answering. */
function Api() {
  return (
    <g>
      <path d="M20 18 10 32l10 14" className="stroke-ink" strokeWidth={2.4} />
      <path d="M44 18l10 14-10 14" className="stroke-ink" strokeWidth={2.4} />
      <line x1="28" y1="32" x2="36" y2="32" className="stroke-blue" strokeWidth={2.4} />
      <circle cx="26" cy="32" r="3" className="fill-blue" />
      <circle cx="38" cy="32" r="3" className="fill-blue" />
    </g>
  );
}
