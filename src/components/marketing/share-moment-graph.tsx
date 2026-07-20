"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/cn";

type NodePos = { id: string; src: string; x: number; y: number };

const NODE = 88;
const STAGE_H = 220;

const INITIAL: NodePos[] = [
  { id: "a", src: "/images/story-plans.jpg", x: 0.18, y: 0.42 },
  { id: "b", src: "/images/story-partners.jpg", x: 0.5, y: 0.5 },
  { id: "c", src: "/images/story-team.jpg", x: 0.82, y: 0.4 },
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
    const pad = NODE / 2 / r.width;
    const padY = NODE / 2 / r.height;
    const x = clamp((e.clientX - r.left) / r.width, pad, 1 - pad);
    const y = clamp((e.clientY - r.top) / r.height, padY, 1 - padY);
    setNodes((prev) =>
      prev.map((n) => (n.id === dragId ? { ...n, x, y } : n)),
    );
  }

  function onPointerUp() {
    setDragId(null);
  }

  return (
    <div
      ref={stageRef}
      className="relative mx-auto mt-14 h-[220px] w-full max-w-xl select-none sm:h-[240px]"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerDown={measure}
    >
      {/* Soft glow behind the cluster */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[12%] rounded-[40%] bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.08),transparent_70%)]"
      />

      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d4d9e2 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Graph edges */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden
      >
        {edges.map(({ from, to }) => {
          const x1 = from.px;
          const y1 = from.py;
          const x2 = to.px;
          const y2 = to.py;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2 - Math.min(28, Math.abs(x2 - x1) * 0.08);
          return (
            <path
              key={`${from.id}-${to.id}`}
              d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="6 7"
              strokeLinecap="round"
              className="transition-[d] duration-75"
            />
          );
        })}
      </svg>

      {points.map((n) => (
        <button
          key={n.id}
          type="button"
          aria-label="Drag to rearrange"
          onPointerDown={(e) => onPointerDown(e, n.id)}
          className={cn(
            "absolute touch-none overflow-hidden rounded-[22px] border border-white bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)] transition-shadow",
            "cursor-grab active:cursor-grabbing",
            dragId === n.id &&
              "z-10 shadow-[0_16px_48px_rgba(15,23,42,0.18)] ring-2 ring-[#3b82f6]/35",
          )}
          style={{
            width: NODE,
            height: NODE,
            left: n.px,
            top: n.py,
            transform: "translate(-50%, -50%)",
          }}
        >
          <Image
            src={n.src}
            alt=""
            fill
            className="pointer-events-none object-cover"
            sizes="88px"
            draggable={false}
          />
        </button>
      ))}

      <p className="pointer-events-none absolute right-3 bottom-2 text-[10px] font-medium tracking-wide text-[#94a3b8]">
        Drag to rearrange
      </p>
    </div>
  );
}
