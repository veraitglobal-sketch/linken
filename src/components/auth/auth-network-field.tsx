import { cn } from "@/lib/cn";

/* A network of companies drawn across the field: solid links are confirmed,
   dashed ones are still waiting on the other side. Fixed coordinates in a
   1000×1000 box so the drawing is identical on every render. */
const NODES = [
  [80, 120], [260, 70], [420, 180], [180, 300], [70, 470], [300, 520],
  [120, 690], [260, 860], [480, 760], [620, 900], [760, 780], [900, 880],
  [940, 640], [820, 520], [930, 360], [780, 220], [880, 80], [640, 60],
  [560, 330], [700, 420],
] as const;

const LINKS: { a: number; b: number; confirmed: boolean }[] = [
  { a: 0, b: 1, confirmed: true },
  { a: 1, b: 2, confirmed: true },
  { a: 0, b: 3, confirmed: false },
  { a: 3, b: 4, confirmed: true },
  { a: 4, b: 5, confirmed: false },
  { a: 4, b: 6, confirmed: true },
  { a: 6, b: 7, confirmed: true },
  { a: 7, b: 8, confirmed: false },
  { a: 8, b: 9, confirmed: true },
  { a: 9, b: 10, confirmed: true },
  { a: 10, b: 11, confirmed: false },
  { a: 11, b: 12, confirmed: true },
  { a: 12, b: 13, confirmed: true },
  { a: 13, b: 14, confirmed: false },
  { a: 14, b: 15, confirmed: true },
  { a: 15, b: 16, confirmed: true },
  { a: 15, b: 17, confirmed: false },
  { a: 17, b: 1, confirmed: true },
  { a: 2, b: 18, confirmed: false },
  { a: 18, b: 19, confirmed: true },
  { a: 19, b: 13, confirmed: true },
  { a: 10, b: 13, confirmed: false },
];

/** Confirmed links that carry a travelling bead: index into LINKS. */
const BEADS = [
  { link: 1, dur: 4.2, delay: 0 },
  { link: 5, dur: 3.6, delay: 1.2 },
  { link: 9, dur: 4.8, delay: 0.6 },
  { link: 14, dur: 3.9, delay: 2 },
  { link: 19, dur: 4.4, delay: 1.6 },
];

/** Nodes that carry a lime "confirmed" dot. */
const LIT = new Set([1, 6, 9, 12, 15, 19]);

/**
 * The navy field behind the auth screens: a quiet network of companies —
 * solid links confirmed, dashed ones pending — with the centre kept clear.
 * Animations are CSS/SMIL and stop under reduced motion.
 */
export function AuthNetworkField({ clearCenter = true }: { clearCenter?: boolean }) {
  return (
    <>
      {/* Depth, not light: navy into a deep green toward the corners. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #0b1816 0%, var(--navy) 45%, #12302a 100%)",
        }}
      />

      <svg
        aria-hidden
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        className={cn("pointer-events-none absolute inset-0 h-full w-full")}
        style={
          clearCenter
            ? {
                maskImage:
                  "radial-gradient(ellipse 34% 30% at 50% 47%, transparent 55%, black 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 34% 30% at 50% 47%, transparent 55%, black 100%)",
              }
            : {
                /* Behind a text column: fade the drawing out where the copy sits. */
                opacity: 0.55,
                maskImage: "linear-gradient(100deg, transparent 20%, black 75%)",
                WebkitMaskImage: "linear-gradient(100deg, transparent 20%, black 75%)",
              }
        }
      >
        {LINKS.map(({ a, b, confirmed }) => {
          const [x1, y1] = NODES[a]!;
          const [x2, y2] = NODES[b]!;
          return (
            <line
              key={`${a}-${b}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={confirmed ? "rgba(205,239,132,0.32)" : "rgba(197,205,200,0.22)"}
              strokeWidth={confirmed ? 1.4 : 1.1}
              strokeDasharray={confirmed ? undefined : "5 7"}
              strokeLinecap="round"
              className={confirmed ? undefined : "net-dash"}
            />
          );
        })}
        {NODES.map(([x, y], i) => (
          <g key={i}>
            {LIT.has(i) ? (
              <circle
                cx={x}
                cy={y}
                r={12}
                fill="none"
                stroke="rgba(205,239,132,0.5)"
                strokeWidth={1.2}
                className="net-pulse"
                style={{ animationDelay: `${(i % 5) * 0.6}s` }}
              />
            ) : null}
            <circle
              cx={x}
              cy={y}
              r={LIT.has(i) ? 4.5 : 3.5}
              fill={LIT.has(i) ? "var(--lime)" : "rgba(197,205,200,0.55)"}
            />
          </g>
        ))}
        {/* A confirmation travelling between two companies, on a few of the
            confirmed links. Hidden under reduced motion. */}
        {BEADS.map(({ link, dur, delay }) => {
          const { a, b } = LINKS[link]!;
          const [x1, y1] = NODES[a]!;
          const [x2, y2] = NODES[b]!;
          return (
            <circle key={link} r={3.2} fill="var(--lime)" className="net-bead" opacity={0.9}>
              <animateMotion
                dur={`${dur}s`}
                begin={`${delay}s`}
                repeatCount="indefinite"
                path={`M${x1} ${y1} L${x2} ${y2}`}
              />
            </circle>
          );
        })}
      </svg>
    </>
  );
}
