import { Art, Badge, ICON, INK, Icon, LIME, Tile } from "@/components/marketing/home-bento-art";

const BUILDING = "M4 21V4h10v17M14 9h6v12M7.5 8h3M7.5 12h3M7.5 16h3M17 13h.01M17 17h.01M2.5 21h19";
const LOCK = ICON.lock;

function Seal({ x, y, r = 26 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={INK} />
      <line x1={x - r * 0.32} y1={y} x2={x + r * 0.32} y2={y} stroke={LIME} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={x - r * 0.38} cy={y} r={r * 0.14} fill={LIME} />
      <circle cx={x + r * 0.38} cy={y} r={r * 0.14} fill={LIME} />
    </g>
  );
}

/** Qualification pack that stays current — trades around one mark. */
export function ArtContractor() {
  const s = "uc-trade";
  const hub = { x: 200, y: 128 };
  const nodes = [
    { x: 78, y: 86 },
    { x: 322, y: 80 },
    { x: 96, y: 196 },
    { x: 310, y: 188 },
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
        <g key={`n-${n.x}`}>
          <Tile x={n.x} y={n.y} r={26} icon={ICON.user} shadow={s} />
          <Badge x={n.x + 20} y={n.y - 20} icon={ICON.check} />
        </g>
      ))}
      <Tile x={hub.x} y={hub.y} r={36} icon={ICON.check} shadow={s} fill={INK} stroke={INK} iconColor={LIME} />
    </Art>
  );
}

/** Practice elevation — geometry, not a named building. */
export function ArtArchitecture() {
  const s = "uc-arch";
  return (
    <Art id={s}>
      <g filter={`url(#${s})`}>
        <rect x={70} y={88} width={72} height={152} rx={6} fill="#ffffff" stroke={INK} strokeWidth={1.6} />
        <rect x={150} y={48} width={88} height={192} rx={6} fill="#ffffff" stroke={INK} strokeWidth={1.6} />
        <rect x={246} y={108} width={64} height={132} rx={6} fill="#ffffff" stroke={INK} strokeWidth={1.6} />
      </g>
      {[100, 132, 164, 196].map((y) => (
        <rect key={y} x={88} y={y} width={36} height={18} rx={3} fill={y === 132 ? LIME : "#f1f3ef"} stroke={INK} strokeWidth={1.1} />
      ))}
      {[80, 116, 152, 188].map((y) => (
        <rect key={y} x={168} y={y} width={52} height={22} rx={3} fill={y === 116 ? LIME : "#f1f3ef"} stroke={INK} strokeWidth={1.1} />
      ))}
      <Seal x={330} y={86} />
    </Art>
  );
}

/** Capability linked across firms. */
export function ArtEngineering() {
  const s = "uc-eng";
  return (
    <Art id={s}>
      <path d="M80 170 C 140 90, 200 90, 248 128" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <path d="M248 128 C 300 170, 330 110, 340 86" stroke={INK} strokeWidth={1.8} strokeDasharray="6 7" strokeLinecap="round" />
      <Tile x={80} y={170} icon={ICON.user} shadow={s} />
      <Tile x={248} y={128} r={34} icon={ICON.link} shadow={s} fill={INK} stroke={INK} iconColor={LIME} />
      <Tile x={340} y={86} icon={ICON.user} shadow={s} dashed />
      <Badge x={268} y={106} icon={ICON.check} />
      <g transform="translate(148 64)">
        <Icon d={BUILDING} x={0} y={0} size={22} />
      </g>
    </Art>
  );
}

/** Case study the client stands behind — body locked, mark earned. */
export function ArtAgency() {
  const s = "uc-agency";
  return (
    <Art id={s}>
      <g filter={`url(#${s})`}>
        <rect x={64} y={52} width={240} height={200} rx={16} fill="#ffffff" stroke={INK} strokeWidth={1.6} />
      </g>
      <rect x={84} y={72} width={120} height={10} rx={5} fill={INK} opacity="0.85" />
      <rect x={84} y={98} width={196} height={8} rx={4} fill={INK} opacity="0.15" />
      <rect x={84} y={114} width={176} height={8} rx={4} fill={INK} opacity="0.15" />
      <rect x={84} y={130} width={188} height={8} rx={4} fill={INK} opacity="0.15" />
      <Tile x={108} y={186} r={24} icon={LOCK} shadow={s} />
      <Seal x={320} y={168} r={32} />
    </Art>
  );
}
