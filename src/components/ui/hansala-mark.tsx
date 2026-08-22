/**
 * Hansala's own mark — the favicon, drawn open.
 *
 * The glyph is the one in `src/app/icon.svg`: two nodes joined on the diagonal.
 * That is the mark; the check rosette in `verified-badge.tsx` is a different
 * thing entirely — it states that a *record* is confirmed, not that a link
 * points at us, and using it as a profile button said the wrong word.
 *
 * Open, not filled. The favicon carries a solid white plate because it sits on
 * whatever chrome a browser gives it. In a row beside Instagram, YouTube,
 * LinkedIn and TikTok — four solid coloured glyphs — a fifth solid tile reads
 * as a fifth platform. A hairline chip with the ground showing through does the
 * opposite: it separates ours from theirs at a glance, and it keeps the row
 * from becoming five competing colours on a page whose palette has two.
 *
 * The nodes stay filled. At 20px hollow circles at this stroke weight close up
 * into blobs, and the mark stops being two nodes and a link.
 */

type Props = {
  size?: number;
  className?: string;
  /** Chip and glyph both. Defaults to the surrounding text colour. */
  color?: string;
};

export function HansalaMark({ size = 20, className, color }: Props) {
  const stroke = color ?? "currentColor";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden
      focusable="false"
    >
      {/* The favicon's rounded square, kept as an outline so the page shows
          through. Inset by half the stroke so the border sits inside the box
          rather than being clipped by the viewBox edge. */}
      <rect
        x="1.6"
        y="1.6"
        width="44.8"
        height="44.8"
        rx="10"
        fill="none"
        stroke={stroke}
        strokeWidth="3.2"
        opacity="0.35"
      />
      <g stroke={stroke} fill={stroke} strokeLinecap="round">
        <line
          x1="15.5"
          y1="32.5"
          x2="32.5"
          y2="15.5"
          strokeWidth="3.4"
        />
        <circle cx="15.5" cy="32.5" r="4.6" stroke="none" />
        <circle cx="32.5" cy="15.5" r="4.6" stroke="none" />
      </g>
    </svg>
  );
}
