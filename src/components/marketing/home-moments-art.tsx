import {
  Art,
  Badge,
  ICON,
  INK,
  Icon,
  LIME,
  Tile,
} from "@/components/marketing/home-bento-art";

/**
 * Carousel illustrations — the bento's line language, set more formally for
 * the four moments work is won: paper, stamps, lists, a building. No sprouts
 * or sparkles here; these are the serious cards.
 *
 * 560×260, drawn to meet the panel's bottom edge.
 */

const VB = "0 0 560 260";
const PAPER = "#ffffff";

const DOC = {
  pen: "M4 20l4.5-1 10-10-3.5-3.5-10 10L4 20ZM13.5 7l3.5 3.5",
  phone:
    "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  building: "M4 21V4h10v17M14 9h6v12M7.5 8h3M7.5 12h3M7.5 16h3M17 13h.01M17 17h.01M2.5 21h19",
  stamp: "M9 4h6v5l3 3v3H6v-3l3-3V4ZM5 19h14",
} as const;

/** Faint drafting grid behind every scene. */
function Grid() {
  return (
    <g opacity="0.5">
      {Array.from({ length: 13 }, (_, i) => (
        <line key={`v${i}`} x1={i * 44 + 16} y1={0} x2={i * 44 + 16} y2={260} stroke={INK} strokeWidth={0.5} opacity="0.12" />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 44 + 20} x2={560} y2={i * 44 + 20} stroke={INK} strokeWidth={0.5} opacity="0.12" />
      ))}
    </g>
  );
}

/** A text line on paper — a neutral bar, never invented words. */
function Line({ x, y, w, strong }: { x: number; y: number; w: number; strong?: boolean }) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={strong ? 9 : 6}
      rx={strong ? 4.5 : 3}
      fill={INK}
      opacity={strong ? 0.85 : 0.14}
    />
  );
}

function Seal({ x, y, r = 26 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={INK} />
      <circle cx={x} cy={y} r={r - 6} stroke={LIME} strokeWidth={1.1} strokeDasharray="2.5 3.5" />
      <line x1={x - r * 0.3} y1={y} x2={x + r * 0.3} y2={y} stroke={LIME} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={x - r * 0.38} cy={y} r={r * 0.14} fill={LIME} />
      <circle cx={x + r * 0.38} cy={y} r={r * 0.14} fill={LIME} />
    </g>
  );
}

/* ------------------------------------------------------------------------ */

/** Proposals — the proposal, with the confirmed reference sheet clipped on. */
export function ArtProposals() {
  const s = "ma-proposals";
  return (
    <Art id={s} viewBox={VB}>
      <Grid />
      {/* back pages */}
      <rect x={150} y={52} width={210} height={240} rx={8} fill={PAPER} stroke={INK} strokeWidth={1.4} transform="rotate(-6 255 170)" />
      <g filter={`url(#${s})`}>
        <rect x={160} y={40} width={210} height={240} rx={8} fill={PAPER} stroke={INK} strokeWidth={1.6} />
      </g>
      <Line x={184} y={66} w={110} strong />
      <Line x={184} y={88} w={160} />
      <Line x={184} y={102} w={140} />
      <Line x={184} y={116} w={150} />
      <Line x={184} y={140} w={160} />
      <Line x={184} y={154} w={120} />
      {/* reference sheet, clipped */}
      <g transform="rotate(5 330 170)">
        <g filter={`url(#${s})`}>
          <rect x={272} y={96} width={176} height={190} rx={8} fill={PAPER} stroke={INK} strokeWidth={1.6} />
        </g>
        <rect x={272} y={96} width={176} height={34} rx={8} fill={LIME} stroke={INK} strokeWidth={1.6} />
        <Line x={290} y={110} w={80} strong />
        {[148, 178, 208].map((y) => (
          <g key={y}>
            <circle cx={296} cy={y + 3} r={8} fill={LIME} stroke={INK} strokeWidth={1.3} />
            <Icon d={ICON.check} x={296} y={y + 3} size={10} width={2.2} />
            <Line x={312} y={y} w={96} />
          </g>
        ))}
        <Seal x={410} y={246} r={24} />
      </g>
      {/* paper clip */}
      <path d="M300 84 v26 a9 9 0 0 0 18 0 V78 a13 13 0 0 0-26 0 v36" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      {/* pen */}
      <g transform="translate(96 150) rotate(-35)">
        <rect x={-6} y={-70} width={12} height={110} rx={6} fill={PAPER} stroke={INK} strokeWidth={1.6} />
        <rect x={-6} y={-70} width={12} height={22} rx={6} fill={INK} />
        <path d="M-6 40 L0 56 L6 40 Z" fill={PAPER} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      </g>
    </Art>
  );
}

/** Tenders — the reference requirements, two certified, one outstanding. */
export function ArtTenders() {
  const s = "ma-tenders";
  return (
    <Art id={s} viewBox={VB}>
      <Grid />
      {/* folder back */}
      <path d="M120 60 h110 l18 20 h192 v200 H120 Z" fill={LIME} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <g filter={`url(#${s})`}>
        <rect x={146} y={96} width={268} height={190} rx={10} fill={PAPER} stroke={INK} strokeWidth={1.6} />
      </g>
      <Line x={170} y={118} w={130} strong />
      {/* requirement rows */}
      {[
        { y: 146, state: "done" },
        { y: 186, state: "done" },
        { y: 226, state: "open" },
      ].map((r) => (
        <g key={r.y}>
          <rect
            x={166}
            y={r.y}
            width={228}
            height={30}
            rx={8}
            fill={r.state === "done" ? "#f6fbe9" : PAPER}
            stroke={INK}
            strokeWidth={1.2}
            strokeDasharray={r.state === "open" ? "4 4" : undefined}
            opacity={r.state === "open" ? 0.7 : 1}
          />
          {r.state === "done" ? (
            <Badge x={184} y={r.y + 15} icon={ICON.check} />
          ) : (
            <circle cx={184} cy={r.y + 15} r={10} stroke={INK} strokeWidth={1.3} strokeDasharray="3 3" />
          )}
          <Line x={204} y={r.y + 12} w={r.state === "done" ? 120 : 90} />
        </g>
      ))}
      {/* stamp */}
      <g transform="translate(454 120) rotate(14)">
        <Tile x={0} y={0} r={34} icon={DOC.stamp} shadow={s} iconSize={30} />
      </g>
      <g transform="rotate(-10 454 200)" opacity="0.9">
        <rect x={420} y={186} width={82} height={30} rx={6} stroke={INK} strokeWidth={1.6} strokeDasharray="0" />
        <Line x={432} y={198} w={58} />
      </g>
    </Art>
  );
}

/** Sales — the profile they looked at, then the call. */
export function ArtSales() {
  const s = "ma-sales";
  return (
    <Art id={s} viewBox={VB}>
      <Grid />
      {/* profile window */}
      <g filter={`url(#${s})`}>
        <rect x={96} y={44} width={290} height={240} rx={14} fill={PAPER} stroke={INK} strokeWidth={1.6} />
      </g>
      <line x1={96} y1={74} x2={386} y2={74} stroke={INK} strokeWidth={1.3} />
      {[114, 128, 142].map((x) => (
        <circle key={x} cx={x} cy={59} r={3.6} stroke={INK} strokeWidth={1.2} />
      ))}
      <rect x={96} y={74} width={290} height={46} fill={LIME} opacity="0.55" />
      <rect x={118} y={96} width={52} height={52} rx={12} fill={PAPER} stroke={INK} strokeWidth={1.6} />
      <Icon d={DOC.building} x={144} y={122} size={26} />
      <Line x={184} y={132} w={96} strong />
      <Line x={184} y={148} w={64} />
      {/* confirmed partner row */}
      {[176, 210].map((y) => (
        <g key={y}>
          <rect x={118} y={y} width={220} height={26} rx={13} fill="#f6fbe9" stroke={INK} strokeWidth={1.1} />
          <circle cx={132} cy={y + 13} r={7} fill={INK} />
          <Line x={146} y={y + 10} w={90} />
          <Badge x={318} y={y + 13} icon={ICON.check} />
        </g>
      ))}
      {/* cursor */}
      <g transform="translate(300 250)">
        <Icon d={ICON.cursor} x={0} y={0} size={28} />
      </g>
      {/* phone and bubble */}
      <g filter={`url(#${s})`}>
        <rect x={404} y={96} width={92} height={170} rx={16} fill={PAPER} stroke={INK} strokeWidth={1.6} />
      </g>
      <rect x={436} y={106} width={28} height={5} rx={2.5} fill={INK} opacity="0.3" />
      <Tile x={450} y={196} r={24} icon={DOC.phone} shadow={s} fill={INK} stroke={INK} iconColor={LIME} iconSize={22} />
      <path d="M466 170 q8 -10 18 -6 M470 160 q14 -16 30 -8" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
      <g>
        <path d="M404 40 h110 a10 10 0 0 1 10 10 v30 a10 10 0 0 1-10 10 h-70 l-16 14 v-14 h-24 a10 10 0 0 1-10-10 v-30 a10 10 0 0 1 10-10 Z" fill={PAPER} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" filter={`url(#${s})`} />
        <Badge x={426} y={65} icon={ICON.check} />
        <Line x={444} y={62} w={60} />
      </g>
    </Art>
  );
}

/** Procurement — the buyer's office checking a vendor list, record or none. */
export function ArtProcurement() {
  const s = "ma-procurement";
  return (
    <Art id={s} viewBox={VB}>
      <Grid />
      {/* building */}
      <g filter={`url(#${s})`}>
        <rect x={70} y={70} width={120} height={200} rx={6} fill={PAPER} stroke={INK} strokeWidth={1.6} />
      </g>
      <rect x={70} y={70} width={120} height={22} rx={6} fill={INK} />
      {[108, 140, 172, 204].map((y) =>
        [88, 120, 152].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={20} height={20} rx={3} fill={y === 140 && x === 120 ? LIME : "#f1f3ef"} stroke={INK} strokeWidth={1.1} />
        )),
      )}
      {/* dotted flow to list */}
      <path d="M196 150 C 230 150, 238 120, 262 120" stroke={INK} strokeWidth={1.6} strokeDasharray="4 6" strokeLinecap="round" />
      {/* vendor list */}
      <g filter={`url(#${s})`}>
        <rect x={262} y={60} width={236} height={220} rx={12} fill={PAPER} stroke={INK} strokeWidth={1.6} />
      </g>
      <Line x={284} y={82} w={100} strong />
      {/* vendor with record */}
      <rect x={280} y={108} width={200} height={50} rx={10} fill="#f6fbe9" stroke={INK} strokeWidth={1.2} />
      <rect x={292} y={120} width={26} height={26} rx={6} fill={PAPER} stroke={INK} strokeWidth={1.2} />
      <Icon d={DOC.building} x={305} y={133} size={16} />
      <Line x={328} y={126} w={70} strong />
      <Line x={328} y={140} w={52} />
      <Seal x={452} y={133} r={16} />
      {/* vendor without a file — blank, no verdict */}
      <rect x={280} y={172} width={200} height={50} rx={10} fill={PAPER} stroke={INK} strokeWidth={1.2} strokeDasharray="4 4" />
      <rect x={292} y={184} width={26} height={26} rx={6} stroke={INK} strokeWidth={1.2} strokeDasharray="3 3" />
      <Line x={328} y={190} w={70} />
      <Line x={328} y={204} w={40} />
      {/* magnifier */}
      <g transform="translate(470 222)">
        <circle cx={0} cy={0} r={30} fill={PAPER} fillOpacity="0.6" stroke={INK} strokeWidth={2} />
        <line x1={21} y1={21} x2={46} y2={46} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      </g>
    </Art>
  );
}
