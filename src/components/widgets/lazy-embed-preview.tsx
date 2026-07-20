"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  height: number;
  title: string;
  className?: string;
  /** Scale down for gallery cards */
  scale?: number;
  /** Load immediately (studio modal) — skip IntersectionObserver. */
  eager?: boolean;
};

/** Loads the iframe only once it enters the viewport. */
export function LazyEmbedPreview({
  src,
  height,
  title,
  className,
  scale = 1,
  eager = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  const scaledHeight = Math.round(height * scale);

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden", className)}
      style={{ height: scaledHeight }}
    >
      {active ? (
        <iframe
          src={src}
          title={title}
          height={height}
          width="100%"
          loading="lazy"
          className="block w-full border-0 origin-top-left"
          style={
            scale !== 1
              ? {
                  width: `${100 / scale}%`,
                  transform: `scale(${scale})`,
                  height,
                }
              : undefined
          }
        />
      ) : (
        <div
          className="h-full w-full animate-pulse bg-[#eef1f6]"
          aria-hidden
        />
      )}
    </div>
  );
}
