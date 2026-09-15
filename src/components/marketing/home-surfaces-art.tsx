import type { ReactNode } from "react";
import {
  Art,
  Badge,
  ICON,
  INK,
  Icon,
  LIME,
  Tile,
} from "@/components/marketing/home-bento-art";
import type { SurfaceGlyphKind } from "@/components/marketing/surface-glyph";

/**
 * "One record, every surface" — one large line scene per surface, in the
 * bento's language. Each shows *where* the record appears, never a record's
 * contents: text is neutral bars, logos are blank tiles.
 *
 * 560×420, centred in the accordion's stage.
 */

const VB = "0 0 560 420";
const PAPER = "#ffffff";

const EXTRA = {
  globe:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",
  starOff:
    "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5ZM3 21 21 3",
  building:
    "M4 21V4h10v17M14 9h6v12M7.5 8h3M7.5 12h3M7.5 16h3M17 13h.01M17 17h.01M2.5 21h19",
  printer: "M7 9V3h10v6M6 18H4v-8h16v8h-2M7 14h10v7H7z",
  braces: "M8 4c-2 0-3 1-3 3v2c0 1.5-1 3-2 3 1 0 2 1.5 2 3v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1.5 1 3 2 3-1 0-2 1.5-2 3v2c0 2-1 3-3 3",
} as const;

function Bar({ x, y, w, strong }: { x: number; y: number; w: number; strong?: boolean }) {
  return (
    <rect x={x} y={y} width={w} height={strong ? 10 : 7} rx={strong ? 5 : 3.5} fill={INK} opacity={strong ? 0.85 : 0.14} />
  );
}

/** A browser window outline — the host page every surface lives on. */
function Window({
  x,
  y,
  w,
  h,
  shadow,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  shadow: string;
  children?: ReactNode;
}) {
  return (
    <g>
      <g filter={`url(#${shadow})`}>
        <rect x={x} y={y} width={w} height={h} rx={18} fill={PAPER} stroke={INK} strokeWidth={1.7} />
      </g>
      <line x1={x} y1={y + 36} x2={x + w} y2={y + 36} stroke={INK} strokeWidth={1.4} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + 22 + i * 15} cy={y + 18} r={4.2} stroke={INK} strokeWidth={1.3} />
      ))}
      <rect x={x + 76} y={y + 10} width={Math.min(220, w - 110)} height={16} rx={8} fill={INK} opacity={0.06} />
      {children}
    </g>
  );
}

function Seal({ x, y, r = 30 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={INK} />
      <circle cx={x} cy={y} r={r - 7} stroke={LIME} strokeWidth={1.2} strokeDasharray="2.5 3.5" />
      <line x1={x - r * 0.3} y1={y} x2={x + r * 0.3} y2={y} stroke={LIME} strokeWidth={3} strokeLinecap="round" />
      <circle cx={x - r * 0.38} cy={y} r={r * 0.14} fill={LIME} />
      <circle cx={x + r * 0.38} cy={y} r={r * 0.14} fill={LIME} />
    </g>
  );
}

/* ------------------------------------------------------------------------ */

function Testimonials() {
  const s = "sa-testimonials";
  return (
    <Art id={s} viewBox={VB}>
      <Window x={40} y={40} w={420} h={330} shadow={s}>
        <Bar x={70} y={100} w={150} strong />
        <Bar x={70} y={122} w={260} />
      </Window>
      <g filter={`url(#${s})`}>
        <rect x={120} y={160} width={380} height={200} rx={20} fill={PAPER} stroke={INK} strokeWidth={1.7} />
      </g>
      {/* opening quotation marks: two filled comma shapes */}
      {[150, 180].map((x) => (
        <path
          key={x}
          d={`M${x} 226 v-14 c0-14 7-24 20-28 l3 7 c-7 3-10 8-10 13 h8 v22 z`}
          fill={LIME}
          stroke={INK}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ))}
      <Bar x={214} y={196} w={250} />
      <Bar x={214} y={216} w={230} />
      <Bar x={150} y={250} w={300} />
      <Bar x={150} y={270} w={210} />
      <line x1={150} y1={300} x2={470} y2={300} stroke={INK} strokeWidth={1.2} opacity="0.2" />
      <circle cx={166} cy={328} r={14} stroke={INK} strokeWidth={1.4} />
      <Bar x={190} y={322} w={90} strong />
      <Tile x={470} y={160} r={34} icon={ICON.lock} shadow={s} fill={INK} stroke={INK} iconColor={LIME} iconSize={30} />
    </Art>
  );
}

function LogoWall() {
  const s = "sa-logos";
  const cells = [
    { x: 90, y: 130, on: true },
    { x: 210, y: 130, on: true },
    { x: 330, y: 130, on: true },
    { x: 90, y: 230, on: true },
    { x: 210, y: 230, on: true },
    { x: 330, y: 230, on: false },
  ];
  return (
    <Art id={s} viewBox={VB}>
      <Window x={50} y={50} w={460} h={320} shadow={s}>
        <Bar x={80} y={104} w={130} strong />
      </Window>
      {cells.map((c) =>
        c.on ? (
          <g key={`${c.x}-${c.y}`}>
            <rect x={c.x} y={c.y} width={100} height={76} rx={14} fill="#f6fbe9" stroke={INK} strokeWidth={1.4} />
            <rect x={c.x + 26} y={c.y + 30} width={48} height={16} rx={8} fill={INK} opacity="0.75" />
            <Badge x={c.x + 94} y={c.y + 6} icon={ICON.check} />
          </g>
        ) : (
          <g key={`${c.x}-${c.y}`}>
            <rect x={c.x} y={c.y} width={100} height={76} rx={14} stroke={INK} strokeWidth={1.4} strokeDasharray="5 5" />
            <Tile x={c.x + 50} y={c.y + 38} r={20} icon={ICON.plus} shadow={s} fill={LIME} iconSize={20} />
          </g>
        ),
      )}
      {/* the new one arriving */}
      <path d="M520 150 C 500 190, 470 210, 440 250" stroke={INK} strokeWidth={1.6} strokeDasharray="4 6" strokeLinecap="round" />
      <g filter={`url(#${s})`}>
        <rect x={472} y={96} width={70} height={54} rx={12} fill={PAPER} stroke={INK} strokeWidth={1.5} transform="rotate(10 507 123)" />
      </g>
      <rect x={490} y={116} width={34} height={12} rx={6} fill={INK} opacity="0.75" transform="rotate(10 507 123)" />
    </Art>
  );
}

function VerificationMark() {
  const s = "sa-mark";
  const cx = 280;
  const cy = 190;
  const pts = Array.from({ length: 36 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 36 - Math.PI / 2;
    const r = i % 2 === 0 ? 104 : 92;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <Art id={s} viewBox={VB}>
      {/* site footer strip */}
      <g filter={`url(#${s})`}>
        <rect x={40} y={318} width={480} height={70} rx={16} fill={PAPER} stroke={INK} strokeWidth={1.6} />
      </g>
      <Bar x={66} y={346} w={110} />
      <Bar x={196} y={346} w={80} />
      <rect x={404} y={336} width={96} height={34} rx={17} fill={INK} />
      <circle cx={424} cy={353} r={7} fill={LIME} />
      <rect x={438} y={349} width={48} height={8} rx={4} fill={LIME} opacity="0.8" />
      <path d="M452 318 C 440 290, 380 280, 350 262" stroke={INK} strokeWidth={1.6} strokeDasharray="4 6" strokeLinecap="round" />
      {/* the seal */}
      <polygon points={pts} fill={PAPER} stroke={INK} strokeWidth={1.7} strokeLinejoin="round" filter={`url(#${s})`} />
      <Seal x={cx} y={cy} r={62} />
      <Tile x={124} y={110} r={30} icon={EXTRA.globe} shadow={s} iconSize={30} />
      <Badge x={146} y={88} icon={ICON.check} />
      <Tile x={440} y={100} r={26} icon={ICON.tagOff} shadow={s} iconSize={24} />
    </Art>
  );
}

function PublicProfile() {
  const s = "sa-profile";
  return (
    <Art id={s} viewBox={VB}>
      <Window x={60} y={30} w={440} h={370} shadow={s}>
        <rect x={60} y={66} width={440} height={70} fill={LIME} opacity="0.6" />
      </Window>
      <rect x={90} y={104} width={76} height={76} rx={18} fill={PAPER} stroke={INK} strokeWidth={1.7} />
      <Icon d={EXTRA.building} x={128} y={142} size={40} />
      <Bar x={184} y={150} w={150} strong />
      <Bar x={184} y={170} w={100} />
      <Badge x={344} y={155} icon={ICON.check} />
      {[214, 262, 310].map((y) => (
        <g key={y}>
          <rect x={90} y={y} width={300} height={36} rx={18} fill="#f6fbe9" stroke={INK} strokeWidth={1.2} />
          <circle cx={110} cy={y + 18} r={9} fill={INK} />
          <Bar x={128} y={y + 14} w={130} />
          <Badge x={370} y={y + 18} icon={ICON.check} />
        </g>
      ))}
      <Tile x={450} y={250} r={32} icon={EXTRA.starOff} shadow={s} iconSize={30} />
    </Art>
  );
}

function OnePager() {
  const s = "sa-onepager";
  return (
    <Art id={s} viewBox={VB}>
      {/* printer */}
      <g filter={`url(#${s})`}>
        <rect x={130} y={250} width={300} height={110} rx={20} fill={PAPER} stroke={INK} strokeWidth={1.7} />
      </g>
      <rect x={160} y={272} width={240} height={14} rx={7} fill={INK} />
      <circle cx={396} cy={320} r={7} fill={LIME} stroke={INK} strokeWidth={1.3} />
      <Bar x={160} y={318} w={90} />
      {/* the sheet coming out */}
      <g filter={`url(#${s})`}>
        <path d="M184 280 V 40 h192 v240 Z" fill={PAPER} stroke={INK} strokeWidth={1.7} strokeLinejoin="round" />
      </g>
      <rect x={184} y={40} width={192} height={36} fill={LIME} opacity="0.6" />
      <Bar x={204} y={54} w={80} strong />
      {[100, 130, 160, 190].map((y) => (
        <g key={y}>
          <circle cx={212} cy={y + 4} r={8} fill={LIME} stroke={INK} strokeWidth={1.2} />
          <Icon d={ICON.check} x={212} y={y + 4} size={10} width={2.2} />
          <Bar x={228} y={y} w={110} />
        </g>
      ))}
      <Seal x={336} y={234} r={26} />
      <Tile x={470} y={130} r={30} icon={EXTRA.printer} shadow={s} iconSize={28} />
    </Art>
  );
}

function PublicApi() {
  const s = "sa-api";
  const nodes = [
    { x: 440, y: 110 },
    { x: 470, y: 220 },
    { x: 430, y: 320 },
  ];
  return (
    <Art id={s} viewBox={VB}>
      <g filter={`url(#${s})`}>
        <rect x={50} y={80} width={290} height={260} rx={18} fill={INK} />
      </g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={74 + i * 15} cy={102} r={4.2} stroke={LIME} strokeWidth={1.3} opacity="0.7" />
      ))}
      <rect x={74} y={134} width={40} height={16} rx={5} fill={LIME} />
      <rect x={124} y={138} width={150} height={8} rx={4} fill={PAPER} opacity="0.5" />
      <Icon d={EXTRA.braces} x={120} y={230} size={80} color={LIME} width={2.6} />
      {[196, 220, 244, 268].map((y, i) => (
        <rect key={y} x={170} y={y} width={[120, 90, 110, 70][i]} height={8} rx={4} fill={PAPER} opacity={i === 1 ? 0.9 : 0.35} />
      ))}
      {nodes.map((n) => (
        <path key={`p${n.y}`} d={`M340 210 C 380 210, 390 ${n.y}, ${n.x - 26} ${n.y}`} stroke={INK} strokeWidth={1.6} strokeDasharray="5 6" strokeLinecap="round" />
      ))}
      {nodes.map((n, i) => (
        <g key={`n${n.y}`}>
          <Tile x={n.x} y={n.y} r={26} icon={[ICON.link, ICON.user, ICON.code][i]!} shadow={s} iconSize={24} />
          {i === 1 ? <Badge x={n.x + 20} y={n.y - 20} icon={ICON.check} /> : null}
        </g>
      ))}
    </Art>
  );
}

export function SurfaceArt({ kind }: { kind: SurfaceGlyphKind }) {
  switch (kind) {
    case "testimonial":
      return <Testimonials />;
    case "logos":
      return <LogoWall />;
    case "mark":
      return <VerificationMark />;
    case "profile":
      return <PublicProfile />;
    case "onepager":
      return <OnePager />;
    case "api":
      return <PublicApi />;
  }
}
