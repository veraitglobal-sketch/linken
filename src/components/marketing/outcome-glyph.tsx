import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export type GlyphKind =
  | "attach"
  | "answer"
  | "network"
  | "resolve"
  | "seal"
  | "endpoint";

/** Per-element delay and tempo, read by the animation classes. */
const beat = (delay: number, dur: number): CSSProperties =>
  ({ "--glyph-delay": `${delay}s`, "--glyph-dur": `${dur}s` }) as CSSProperties;

/**
 * The four moments, drawn from the mark's own vocabulary: nodes, links, rules.
 *
 * Retell hangs a Lottie file beside each feature row. These do the same job in
 * SVG so the colours ride the tokens, and so a marketing page carries no
 * third-party animation runtime.
 *
 * Each says something rather than decorating: a record attaching to a
 * proposal, requirements answering one by one, a network resolving around you,
 * a check returning an answer. Tempos differ per glyph so four in a column
 * never pulse in unison.
 *
 * Everything sits inside a 44×44 optical area of the 64 viewBox, so the four
 * read as one set however the row scales. Structure is 1.4, links are 2 — one
 * weight for what is there, one for what is being established.
 */
export function OutcomeGlyph({
  kind,
  live,
  className,
}: {
  kind: GlyphKind;
  live: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("glyph shrink-0", live && "is-live", className)}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" className="size-full overflow-visible">
        {kind === "attach" ? <Attach /> : null}
        {kind === "answer" ? <Answer /> : null}
        {kind === "network" ? <Network /> : null}
        {kind === "resolve" ? <Resolve /> : null}
        {kind === "seal" ? <Seal /> : null}
        {kind === "endpoint" ? <Endpoint /> : null}
      </svg>
    </div>
  );
}

/** A page of records; the confirmed one lifts off it and links. */
function Attach() {
  return (
    <g fill="none" strokeLinecap="round">
      <rect
        x="12"
        y="10"
        width="34"
        height="44"
        rx="3"
        className="stroke-line"
        strokeWidth={1.4}
      />
      <line x1="19" y1="20" x2="39" y2="20" className="stroke-line" strokeWidth={1.4} />
      <line x1="19" y1="27" x2="33" y2="27" className="stroke-line" strokeWidth={1.4} />
      <line x1="19" y1="34" x2="36" y2="34" className="stroke-line" strokeWidth={1.4} />

      <g className="glyph-lift" style={beat(0, 3.4)}>
        <line
          x1="26"
          y1="45"
          x2="46"
          y2="45"
          className="glyph-link stroke-blue"
          strokeWidth={2}
          style={beat(0.2, 3.4)}
        />
        <circle cx="24" cy="45" r="3.2" className="fill-blue" />
        <circle cx="48" cy="45" r="3.2" className="fill-blue" />
      </g>
    </g>
  );
}

/** Requirements answered, one after another. */
function Answer() {
  const rows = [19, 32, 45];
  return (
    <g fill="none" strokeLinecap="round">
      {rows.map((y, i) => (
        <g key={y}>
          <line
            x1="12"
            y1={y}
            x2="48"
            y2={y}
            className="stroke-line"
            strokeWidth={1.4}
          />
          <line
            x1="12"
            y1={y}
            x2="48"
            y2={y}
            className="glyph-link stroke-blue"
            strokeWidth={2}
            style={beat(i * 0.45, 3.8)}
          />
          <circle
            cx="50"
            cy={y}
            r="3.2"
            className="glyph-node fill-blue"
            style={{ ...beat(i * 0.45, 3.8), transformOrigin: `50px ${y}px` }}
          />
        </g>
      ))}
    </g>
  );
}

/** You, and the partners that resolve around you. */
function Network() {
  const spokes = [
    { x: 16, y: 17 },
    { x: 49, y: 24 },
    { x: 21, y: 47 },
  ];
  return (
    <g fill="none" strokeLinecap="round">
      {spokes.map((s, i) => (
        <g key={`${s.x}-${s.y}`}>
          <line
            x1="32"
            y1="33"
            x2={s.x}
            y2={s.y}
            className="glyph-link stroke-blue"
            strokeWidth={2}
            style={beat(i * 0.5, 4.2)}
          />
          <circle
            cx={s.x}
            cy={s.y}
            r="3.4"
            className="glyph-node fill-blue"
            style={{ ...beat(i * 0.5, 4.2), transformOrigin: `${s.x}px ${s.y}px` }}
          />
        </g>
      ))}
      <circle cx="32" cy="33" r="5.2" className="fill-ink" />
    </g>
  );
}

/** A query sweeps the file and returns the mark. */
function Resolve() {
  return (
    <g fill="none" strokeLinecap="round">
      <rect
        x="10"
        y="13"
        width="44"
        height="38"
        rx="3"
        className="stroke-line"
        strokeWidth={1.4}
      />
      <line
        x1="10"
        y1="21"
        x2="54"
        y2="21"
        className="glyph-sweep stroke-blue-soft"
        strokeWidth={2}
        style={beat(0, 2.9)}
      />
      <line
        x1="24"
        y1="36"
        x2="40"
        y2="36"
        className="glyph-link stroke-blue"
        strokeWidth={2}
        style={beat(0.7, 2.9)}
      />
      <circle cx="22" cy="36" r="3.2" className="fill-blue" />
      <circle cx="42" cy="36" r="3.2" className="fill-blue" />
    </g>
  );
}

/** Domain proof — the ring closes around the mark. */
function Seal() {
  return (
    <g fill="none" strokeLinecap="round">
      <circle
        cx="32"
        cy="32"
        r="19"
        className="glyph-link stroke-blue"
        strokeWidth={2}
        pathLength={30}
        style={beat(0, 3.6)}
      />
      <circle cx="32" cy="32" r="19" className="stroke-line" strokeWidth={1.4} />
      <line
        x1="26"
        y1="32"
        x2="38"
        y2="32"
        className="stroke-blue"
        strokeWidth={2}
      />
      <circle cx="24" cy="32" r="3" className="fill-blue" />
      <circle cx="40" cy="32" r="3" className="fill-blue" />
    </g>
  );
}

/** One endpoint, answering. */
function Endpoint() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20 L12 32 L20 44" className="stroke-line" strokeWidth={1.6} />
      <path d="M44 20 L52 32 L44 44" className="stroke-line" strokeWidth={1.6} />
      <line
        x1="26"
        y1="32"
        x2="38"
        y2="32"
        className="glyph-link stroke-blue"
        strokeWidth={2}
        style={beat(0.3, 3.2)}
      />
      <circle
        cx="24"
        cy="32"
        r="3"
        className="glyph-node fill-blue"
        style={{ ...beat(0.3, 3.2), transformOrigin: "24px 32px" }}
      />
      <circle
        cx="40"
        cy="32"
        r="3"
        className="glyph-node fill-blue"
        style={{ ...beat(0.3, 3.2), transformOrigin: "40px 32px" }}
      />
    </g>
  );
}
