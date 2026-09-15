import type { ReactNode } from "react";

/**
 * Bento line illustrations — flat, hand-drawn-feeling SVG in the house
 * palette: navy strokes, white icon tiles, lime accents. Each draws its
 * card's idea as a small scene rather than a product screenshot, so nothing
 * here stands in for a real record, customer or brand.
 *
 * Every drawing is 400×240 and sits flush with the card's bottom edge.
 */

export const INK = "var(--navy)";
export const LIME = "var(--lime)";

/* 24-unit stroke icons. */
export const ICON = {
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5a7.5 7.5 0 0 1 15 0",
  lock: "M7.5 11V8a4.5 4.5 0 0 1 9 0v3M5.5 11h13v9.5h-13zM12 14.5v2.5",
  eyeOff:
    "M3 3l18 18M10.6 5.2A9.8 9.8 0 0 1 12 5c6 0 9.5 7 9.5 7a16 16 0 0 1-3 3.8M6.5 6.6C3.9 8.4 2.5 12 2.5 12S6 19 12 19a9.5 9.5 0 0 0 5.2-1.5",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.5V12l3 2",
  check: "M5 12.5l4.5 4.5L19 7.5",
  tagOff: "M3.5 12V4.5H11l9.5 9.5-7.5 7.5L3.5 12ZM8 8h.01M3 21 21 3",
  plane: "M21.5 2.5 10.8 13.2M21.5 2.5l-6.8 19-3.9-8.3-8.3-3.9 19-6.8Z",
  cursor: "M5.5 3.5l13 6.5-5.6 1.9-1.9 5.6L5.5 3.5Z",
  code: "M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20.5 20.5l-4.6-4.6",
  calendar: "M4 6h16v14H4zM4 10.5h16M8.5 3.5v4M15.5 3.5v4",
  chat: "M4 5h16v11H9.5L4 20V5Z",
  spark: "M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9L12 3.5Z",
  link: "M10 14a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7l1-1",
  plus: "M12 6v12M6 12h12",
} as const;

export function Icon({
  d,
  x,
  y,
  size = 24,
  color = INK,
  width = 1.8,
}: {
  d: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  width?: number;
}) {
  const s = size / 24;
  return (
    <path
      d={d}
      transform={`translate(${x - size / 2} ${y - size / 2}) scale(${s})`}
      stroke={color}
      strokeWidth={width / s}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

/** A round white tile with an icon — the drawings' basic unit. */
export function Tile({
  x,
  y,
  r = 26,
  icon,
  shadow,
  fill = "#ffffff",
  stroke = INK,
  iconColor = INK,
  dashed,
  iconSize,
}: {
  x: number;
  y: number;
  r?: number;
  icon: string;
  shadow: string;
  fill?: string;
  stroke?: string;
  iconColor?: string;
  dashed?: boolean;
  iconSize?: number;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.6}
        strokeDasharray={dashed ? "4 4" : undefined}
        filter={`url(#${shadow})`}
      />
      <Icon d={icon} x={x} y={y} size={iconSize ?? r * 0.95} color={iconColor} />
    </g>
  );
}

/** Small lime badge with a glyph, pinned to a tile. */
export function Badge({ x, y, icon }: { x: number; y: number; icon: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} fill={LIME} stroke={INK} strokeWidth={1.4} />
      <Icon d={icon} x={x} y={y} size={13} width={2.2} />
    </g>
  );
}

export function Art({
  id,
  children,
  viewBox = "0 0 400 240",
}: {
  id: string;
  children: ReactNode;
  viewBox?: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      className="block h-auto w-full"
      aria-hidden
      fill="none"
    >
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#0e1f1c" floodOpacity="0.14" />
        </filter>
      </defs>
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------------ */

/** Two people, a dashed link not yet made, a lock holding it private. */
export function ArtPrivate() {
  const s = "ba-private";
  return (
    <Art id={s}>
      <path d="M-10 240 C 80 150, 320 150, 410 240 Z" fill="#ffffff" opacity="0.55" />
      <path
        d="M88 168 C 140 130, 160 128, 200 124 S 270 110, 312 96"
        stroke={INK}
        strokeWidth={1.8}
        strokeDasharray="6 7"
        strokeLinecap="round"
      />
      <Tile x={88} y={168} icon={ICON.user} shadow={s} />
      <Tile x={312} y={96} icon={ICON.user} shadow={s} dashed />
      <Badge x={333} y={76} icon={ICON.clock} />
      <Tile x={200} y={124} r={36} icon={ICON.lock} shadow={s} fill={INK} stroke={INK} iconColor={LIME} />
      <Tile x={206} y={200} r={18} icon={ICON.eyeOff} shadow={s} iconSize={18} />
    </Art>
  );
}

/** A rosette seal carrying the mark; the price tag struck through. */
export function ArtEarned() {
  const s = "ba-earned";
  const cx = 200;
  const cy = 118;
  const pts = Array.from({ length: 32 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 32 - Math.PI / 2;
    const r = i % 2 === 0 ? 78 : 68;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <Art id={s}>
      <path d="M170 170 L150 240 L172 226 L186 246 L196 180 Z" fill={LIME} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M230 170 L250 240 L228 226 L214 246 L204 180 Z" fill={LIME} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <polygon points={pts} fill="#ffffff" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" filter={`url(#${s})`} />
      <circle cx={cx} cy={cy} r={50} fill={INK} />
      <circle cx={cx} cy={cy} r={42} stroke={LIME} strokeWidth={1.2} strokeDasharray="3 4" />
      <line x1={cx - 16} y1={cy} x2={cx + 16} y2={cy} stroke={LIME} strokeWidth={4} strokeLinecap="round" />
      <circle cx={cx - 20} cy={cy} r={7} fill={LIME} />
      <circle cx={cx + 20} cy={cy} r={7} fill={LIME} />
      <Tile x={334} y={62} r={24} icon={ICON.tagOff} shadow={s} />
      <g opacity="0.9">
        <Icon d={ICON.spark} x={70} y={70} size={22} />
        <Icon d={ICON.spark} x={96} y={190} size={14} />
      </g>
    </Art>
  );
}

/** A paper plane whose trail stitches a small network together. */
export function ArtNetwork() {
  const s = "ba-network";
  return (
    <Art id={s}>
      <path
        d="M40 210 C 90 200, 110 150, 92 128 C 72 104, 118 84, 150 108 C 180 130, 210 120, 232 92"
        stroke={INK}
        strokeWidth={1.8}
        strokeDasharray="5 7"
        strokeLinecap="round"
      />
      <g transform="translate(232 92) rotate(-20)">
        <Icon d={ICON.plane} x={0} y={0} size={34} />
      </g>
      <path d="M272 70 L346 118 L292 186 Z" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <Tile x={272} y={70} r={22} icon={ICON.user} shadow={s} />
      <Tile x={346} y={118} r={22} icon={ICON.user} shadow={s} />
      <Tile x={292} y={186} r={22} icon={ICON.user} shadow={s} />
      <Badge x={290} y={52} icon={ICON.check} />
      <Badge x={364} y={100} icon={ICON.check} />
      <Badge x={310} y={168} icon={ICON.check} />
      <circle cx={40} cy={210} r={6} fill={LIME} stroke={INK} strokeWidth={1.4} />
    </Art>
  );
}

/** A website window with a seal pinned to it and a cursor reaching for it. */
export function ArtOwnSite() {
  const s = "ba-site";
  return (
    <Art id={s}>
      <g filter={`url(#${s})`}>
        <rect x={56} y={46} width={288} height={214} rx={16} fill="#ffffff" stroke={INK} strokeWidth={1.6} />
      </g>
      <line x1={56} y1={78} x2={344} y2={78} stroke={INK} strokeWidth={1.4} />
      <circle cx={76} cy={62} r={4} stroke={INK} strokeWidth={1.3} />
      <circle cx={90} cy={62} r={4} stroke={INK} strokeWidth={1.3} />
      <circle cx={104} cy={62} r={4} stroke={INK} strokeWidth={1.3} />
      <rect x={82} y={100} width={130} height={12} rx={6} fill={INK} opacity="0.85" />
      <rect x={82} y={124} width={190} height={8} rx={4} fill={INK} opacity="0.15" />
      <rect x={82} y={140} width={160} height={8} rx={4} fill={INK} opacity="0.15" />
      <rect x={82} y={166} width={74} height={26} rx={13} fill={LIME} stroke={INK} strokeWidth={1.4} />
      <Tile x={300} y={196} r={34} icon={ICON.check} shadow={s} fill={INK} stroke={INK} iconColor={LIME} iconSize={30} />
      <g transform="translate(248 206)">
        <Icon d={ICON.cursor} x={0} y={0} size={30} />
      </g>
      <Tile x={344} y={44} r={20} icon={ICON.code} shadow={s} iconSize={18} />
    </Art>
  );
}

/** An empty folder under a magnifier — and a sprout growing out of it. */
export function ArtNoFile() {
  const s = "ba-nofile";
  return (
    <Art id={s}>
      <g filter={`url(#${s})`}>
        <path
          d="M108 118 h58 l14 16 h112 v106 H108 Z"
          fill="#ffffff"
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </g>
      <path d="M150 170 h100" stroke={INK} strokeWidth={1.4} strokeDasharray="4 6" strokeLinecap="round" opacity="0.5" />
      <path d="M200 134 V 80" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <path d="M200 96 C 200 70, 222 58, 246 60 C 246 84, 226 96, 200 96 Z" fill={LIME} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M200 108 C 200 90, 182 80, 162 82 C 162 100, 180 110, 200 108 Z" fill={LIME} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <g transform="translate(300 84)">
        <circle cx={0} cy={0} r={30} fill="#ffffff" stroke={INK} strokeWidth={1.8} filter={`url(#${s})`} />
        <circle cx={0} cy={0} r={20} stroke={INK} strokeWidth={1.4} opacity="0.35" />
        <line x1={21} y1={21} x2={44} y2={44} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      </g>
      <Badge x={126} y={108} icon={ICON.plus} />
    </Art>
  );
}

/** One linked record at the centre, the tools it reaches around it. */
export function ArtTools() {
  const s = "ba-tools";
  const hub = { x: 200, y: 132 };
  const nodes = [
    { x: 78, y: 78, icon: ICON.calendar, badge: true },
    { x: 322, y: 74, icon: ICON.chat },
    { x: 92, y: 200, icon: ICON.code },
    { x: 314, y: 196, icon: ICON.spark, badge: true },
  ];
  return (
    <Art id={s}>
      {nodes.map((n) => (
        <path
          key={`${n.x}-${n.y}`}
          d={`M${hub.x} ${hub.y} Q ${(hub.x + n.x) / 2} ${n.y} ${n.x} ${n.y}`}
          stroke={INK}
          strokeWidth={1.6}
          strokeDasharray="5 6"
          strokeLinecap="round"
        />
      ))}
      {nodes.map((n) => (
        <g key={`t-${n.x}`}>
          <Tile x={n.x} y={n.y} r={28} icon={n.icon} shadow={s} />
          {n.badge ? <Badge x={n.x + 22} y={n.y - 22} icon={ICON.plus} /> : null}
        </g>
      ))}
      <circle cx={hub.x} cy={hub.y} r={52} stroke={INK} strokeWidth={1.2} opacity="0.25" />
      <Tile x={hub.x} y={hub.y} r={38} icon={ICON.link} shadow={s} fill={INK} stroke={INK} iconColor={LIME} iconSize={34} />
    </Art>
  );
}
