import { Art, Badge, ICON, INK, LIME, Tile } from "@/components/marketing/home-bento-art";

/** Two companies, the line between them confirmed. */
export function ArtClientRefs() {
  const s = "uc-refs";
  return (
    <Art id={s}>
      <path d="M-10 240 C 90 155, 310 155, 410 240 Z" fill="#ffffff" opacity="0.55" />
      <path d="M88 150 H 312" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <Tile x={88} y={150} icon={ICON.user} shadow={s} />
      <Tile x={312} y={150} icon={ICON.user} shadow={s} />
      <Badge x={108} y={128} icon={ICON.check} />
      <Badge x={332} y={128} icon={ICON.check} />
      <Tile x={200} y={150} r={36} icon={ICON.link} shadow={s} fill={INK} stroke={INK} iconColor={LIME} />
    </Art>
  );
}

/** Case-study sheets, the front one carrying the mark. */
export function ArtPortfolio() {
  const s = "uc-port";
  return (
    <Art id={s}>
      <rect x={78} y={58} width={170} height={200} rx={14} fill="#ffffff" stroke={INK} strokeWidth={1.6} transform="rotate(-8 163 158)" />
      <g filter={`url(#${s})`}>
        <rect x={148} y={48} width={180} height={210} rx={14} fill="#ffffff" stroke={INK} strokeWidth={1.6} />
      </g>
      <rect x={168} y={68} width={140} height={72} rx={10} fill={LIME} stroke={INK} strokeWidth={1.4} />
      <rect x={168} y={156} width={96} height={8} rx={4} fill={INK} opacity="0.85" />
      <rect x={168} y={174} width={120} height={6} rx={3} fill={INK} opacity="0.15" />
      <rect x={168} y={188} width={108} height={6} rx={3} fill={INK} opacity="0.15" />
      <Tile x={308} y={196} r={28} icon={ICON.check} shadow={s} fill={INK} stroke={INK} iconColor={LIME} />
    </Art>
  );
}

/** A living annex — folder, confirmed rows, one still open. */
export function ArtTenders() {
  const s = "uc-tender";
  return (
    <Art id={s}>
      <path d="M72 72 h88 l14 16 h154 v170 H72 Z" fill={LIME} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <g filter={`url(#${s})`}>
        <rect x={92} y={100} width={220} height={160} rx={12} fill="#ffffff" stroke={INK} strokeWidth={1.6} />
      </g>
      {[118, 158].map((y) => (
        <g key={y}>
          <rect x={112} y={y} width={180} height={28} rx={8} fill="#f6fbe9" stroke={INK} strokeWidth={1.2} />
          <Badge x={130} y={y + 14} icon={ICON.check} />
          <rect x={148} y={y + 11} width={100} height={6} rx={3} fill={INK} opacity="0.2" />
        </g>
      ))}
      <rect x={112} y={198} width={180} height={28} rx={8} fill="#ffffff" stroke={INK} strokeWidth={1.2} strokeDasharray="4 4" />
      <Tile x={332} y={84} r={26} icon={ICON.link} shadow={s} />
    </Art>
  );
}

/** Diligence — a confirmed supplier, and a file that is simply empty. */
export function ArtSupplier() {
  const s = "uc-supply";
  return (
    <Art id={s}>
      <path d="M-10 240 C 90 160, 310 160, 410 240 Z" fill="#ffffff" opacity="0.55" />
      <Tile x={120} y={128} r={34} icon={ICON.user} shadow={s} />
      <Badge x={146} y={104} icon={ICON.check} />
      <Tile x={210} y={168} r={28} icon={ICON.user} shadow={s} dashed />
      <g transform="translate(300 92)">
        <circle cx={0} cy={0} r={36} fill="#ffffff" stroke={INK} strokeWidth={1.8} filter={`url(#${s})`} />
        <circle cx={0} cy={0} r={22} stroke={INK} strokeWidth={1.4} opacity="0.35" />
        <line x1={26} y1={26} x2={52} y2={52} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      </g>
    </Art>
  );
}
