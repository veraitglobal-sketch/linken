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

type NodePos = {
  id: string;
  src: string;
  x: number;
  y: number;
};

const STAGE_H = 220;

/* Back to the photographs, at the owner's call.
   These are Hansala's own images from `public/images` — real people, real work,
   not stock — so nothing is fabricated by using them. They were swapped for
   `HOME_SHOWCASE_LOGOS` on the argument that a graph about confirmed records
   should show companies that actually confirmed; the counter-argument is that
   the nodes read as the people a link travels to, not as a claim about them.
   Kept as three plain sources so the swap is one edit either way. */
const INITIAL: NodePos[] = [
  /* Spread into an arc rather than a flat line across the middle.
     Measured before: the three tiles occupied 124px of a 360px stage, so two
     thirds of the box was empty and the section read as a headline with a void
     under it. Dipping the centre node also gives the dashed edges something to
     describe — a link travelling down and along, instead of three tiles in a
     row. */
  { id: "a", src: "/images/story-plans.jpg", x: 0.16, y: 0.30 },
  { id: "b", src: "/images/story-partners.jpg", x: 0.5, y: 0.66 },
  { id: "c", src: "/images/story-team.jpg", x: 0.84, y: 0.27 },
];

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
      className="relative h-[260px] w-full select-none sm:h-[320px]"
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
          name=""
          initials=""
          photoSrc={n.src}
          x={n.px}
          y={n.py}
          dragging={dragId === n.id}
          onPointerDown={(e) => onPointerDown(e, n.id)}
        />
      ))}
      <p className="pointer-events-none absolute right-1 bottom-0 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
        Drag to rearrange
      </p>
    </div>
  );
}
