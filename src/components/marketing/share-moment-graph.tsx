"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  SHARE_NODE,
  ShareMomentEdge,
  ShareMomentNode,
} from "@/components/marketing/share-moment-parts";
import { HOME_SHOWCASE_LOGOS } from "@/features/marketing/showcase-logos";

type NodePos = {
  id: string;
  name: string;
  initials: string;
  logoUrl?: string | null;
  x: number;
  y: number;
};

const STAGE_H = 220;

/* Real companies, not stock photographs. The nodes stood for the network a
   link carries, and were three generic `story-*.jpg` faces — a section about
   confirmed records showing people who confirmed nothing.
   HOME_SHOWCASE_LOGOS has sat unused in the repo since it was written. */
const INITIAL: NodePos[] = HOME_SHOWCASE_LOGOS.slice(0, 3).map(
  (company, i) => ({
    id: company.name,
    name: company.name,
    initials: company.initials,
    logoUrl: company.logoUrl,
    x: [0.18, 0.5, 0.82][i],
    y: [0.42, 0.5, 0.4][i],
  }),
);

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function ShareMomentGraph() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState(INITIAL);
  const [dragId, setDragId] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 520, h: STAGE_H });

  const measure = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSize({ w: r.width, h: r.height });
  }, []);

  useEffect(() => {
    measure();
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const points = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        px: n.x * size.w,
        py: n.y * size.h,
      })),
    [nodes, size.h, size.w],
  );

  const edges = useMemo(() => {
    const [a, b, c] = points;
    if (!a || !b || !c) return [];
    return [
      { from: a, to: b },
      { from: b, to: c },
    ];
  }, [points]);

  function onPointerDown(e: ReactPointerEvent<HTMLButtonElement>, id: string) {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragId(id);
    measure();
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragId || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const pad = SHARE_NODE / 2 / r.width;
    const padY = SHARE_NODE / 2 / r.height;
    const x = clamp((e.clientX - r.left) / r.width, pad, 1 - pad);
    const y = clamp((e.clientY - r.top) / r.height, padY, 1 - padY);
    setNodes((prev) =>
      prev.map((n) => (n.id === dragId ? { ...n, x, y } : n)),
    );
  }

  return (
    <div
      ref={stageRef}
      className="relative h-[300px] w-full select-none sm:h-[360px]"
      onPointerMove={onPointerMove}
      onPointerUp={() => setDragId(null)}
      onPointerLeave={() => setDragId(null)}
      onPointerDown={measure}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[12%] rounded-[40%] bg-[radial-gradient(ellipse_at_center,var(--accent-soft),transparent_70%)]"
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden
      >
        {edges.map(({ from, to }) => (
          <ShareMomentEdge key={`${from.id}-${to.id}`} from={from} to={to} />
        ))}
      </svg>
      {points.map((n) => (
        <ShareMomentNode
          key={n.id}
          name={n.name}
          initials={n.initials}
          logoUrl={n.logoUrl}
          x={n.px}
          y={n.py}
          dragging={dragId === n.id}
          onPointerDown={(e) => onPointerDown(e, n.id)}
        />
      ))}
      <p className="pointer-events-none absolute right-3 bottom-2 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
        Drag to rearrange
      </p>
    </div>
  );
}
