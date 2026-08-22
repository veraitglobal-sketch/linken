"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLogoWallActive } from "@/components/embed/use-logo-wall-active";
import { cn } from "@/lib/cn";

/**
 * One photo frame in the look-up band, wiping between its own photographs.
 *
 * The motion gate is `useLogoWallActive`, the same hook the embed walls use:
 * it parks the animation on `prefers-reduced-motion`, when the tab is hidden,
 * and when the band is off-screen. Imported rather than reimplemented — a
 * second copy of this logic is how one of them ends up not honouring reduced
 * motion. It lives under `embed/` for historical reasons and carries nothing
 * embed-specific.
 *
 * The wipe is a real slide at full opacity, not a dissolve. Two photographs
 * cross-fading through each other go muddy at the halfway point; one sliding
 * over the other stays sharp the whole way and reads as deliberate.
 *
 * Frames are staggered by `delayMs` so only one is ever in motion. Three
 * photographs moving at once beside a paragraph makes the paragraph unreadable,
 * which is the opposite of what a quiet band is for.
 */

export type WipeDirection = "down" | "across" | "up";

const ANIMATION: Record<WipeDirection, string> = {
  down: "lookup-wipe-down",
  across: "lookup-wipe-across",
  up: "lookup-wipe-up",
};

type Props = {
  /** Two or more photographs, all at this frame's aspect ratio. */
  srcs: string[];
  direction: WipeDirection;
  /** Aspect ratio class — the frame never crops, so this matches the files. */
  ratioClass: string;
  /** Offset into the shared cycle, so the frames take turns. */
  delayMs: number;
  /** How long each photograph rests before the next one wipes over it. */
  periodMs: number;
  sizes: string;
  /** First frame in the band — its first photograph is worth preloading. */
  priority?: boolean;
};

export function HomeLookUpFrame({
  srcs,
  direction,
  ratioClass,
  delayMs,
  periodMs,
  sizes,
  priority = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const active = useLogoWallActive(rootRef);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || srcs.length < 2) return;

    let interval: number | undefined;
    const start = window.setTimeout(() => {
      setIndex((i) => i + 1);
      interval = window.setInterval(() => setIndex((i) => i + 1), periodMs);
    }, delayMs);

    return () => {
      window.clearTimeout(start);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [active, delayMs, periodMs, srcs.length]);

  /* `index` counts up rather than wrapping, so it is also the animation key:
     wrapping it would hand React the same key on every full turn and the wipe
     would not replay. */
  const current = index % srcs.length;
  const under = (index - 1 + srcs.length) % srcs.length;

  return (
    <div
      ref={rootRef}
      className={cn("relative overflow-hidden rounded-[20px]", ratioClass)}
    >
      {/* The photograph being covered. Static and underneath — it needs no
          animation of its own because the incoming one ends up opaque over the
          whole frame. Skipped on the very first render, when nothing has been
          covered yet. */}
      {index > 0 ? (
        <Image
          src={srcs[under]!}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : null}

      <Image
        /* Remounts on every step, which is what replays the wipe. */
        key={index}
        src={srcs[current]!}
        alt=""
        fill
        sizes={sizes}
        priority={priority && index === 0}
        className="object-cover"
        style={
          index > 0
            ? {
                animation: `${ANIMATION[direction]} 900ms cubic-bezier(0.22, 1, 0.36, 1) both`,
              }
            : undefined
        }
      />
    </div>
  );
}
