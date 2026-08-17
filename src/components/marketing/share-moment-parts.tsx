import type { PointerEventHandler } from "react";
import { EmbedBareLogo } from "@/components/embed/embed-bare-logo";
import { cn } from "@/lib/cn";

export const SHARE_NODE = 88;

type Pt = { id: string; px: number; py: number };

export function ShareMomentEdge({ from, to }: { from: Pt; to: Pt }) {
  const mx = (from.px + to.px) / 2;
  const my = (from.py + to.py) / 2 - Math.min(28, Math.abs(to.px - from.px) * 0.08);
  const cx = (from.px + 2 * mx + to.px) / 4;
  const cy = (from.py + 2 * my + to.py) / 4;
  return (
    <g>
      <path
        d={`M ${from.px} ${from.py} Q ${mx} ${my} ${to.px} ${to.py}`}
        fill="none"
        stroke="var(--muted)"
        strokeWidth="2"
        strokeDasharray="6 7"
        strokeLinecap="round"
        className="transition-[d] duration-75"
      />
      <circle
        cx={cx}
        cy={cy}
        r="9"
        fill="var(--surface)"
        stroke="var(--blue-soft)"
        strokeWidth="1.5"
      />
      <path
        d={`M ${cx - 3.5} ${cy} l 2.5 2.5 l 4.5 -5`}
        stroke="var(--blue)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  );
}

export function ShareMomentNode({
  name,
  initials,
  logoUrl,
  x,
  y,
  dragging,
  onPointerDown,
}: {
  name: string;
  initials: string;
  logoUrl?: string | null;
  x: number;
  y: number;
  dragging: boolean;
  onPointerDown: PointerEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      aria-label={`${name} — drag to rearrange`}
      onPointerDown={onPointerDown}
      className={cn(
        "absolute touch-none overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow",
        "cursor-grab active:cursor-grabbing",
        dragging && "z-10 ring-2 ring-blue-soft/50",
      )}
      style={{
        width: SHARE_NODE,
        height: SHARE_NODE,
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <span className="pointer-events-none grid h-full w-full place-items-center px-3">
        <EmbedBareLogo
          name={name}
          initials={initials}
          logoUrl={logoUrl}
          theme="light"
          size="md"
        />
      </span>
    </button>
  );
}
