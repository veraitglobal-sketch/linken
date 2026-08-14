"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

/** Seconds of overlap between the outgoing and incoming pass. */
const FADE = 1.2;

function subscribe(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** Read through the store rather than syncing into state inside an effect —
 *  that cascades a render and the linter rejects it. Server snapshot is
 *  `false` so the markup matches the still-first render. */
function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

/**
 * A still that becomes an endless loop once it is worth it.
 *
 * The clip does not end where it starts, so `loop` on a single element shows
 * a jump cut. Dissolving to the poster hides the cut but stops the motion,
 * which is just as visible.
 *
 * So: two elements, one clip, offset in time. While A runs out its last
 * `FADE` seconds, B restarts from zero and crossfades in over it. The motion
 * never stops and there is no frame where the picture jumps — the texture is
 * an abstract drift, so a dissolve between two points in it reads as nothing
 * at all. Works with any clip, and costs no regeneration.
 *
 * Weight is still gated: 3.2 MB is fetched only once the plate is on screen,
 * and never for a visitor who asked for reduced motion, who keeps the still.
 */
export function AmbientPlate({
  poster,
  src,
  className,
}: {
  poster: string;
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const aRef = useRef<HTMLVideoElement | null>(null);
  const bRef = useRef<HTMLVideoElement | null>(null);
  const [onScreen, setOnScreen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0, rootMargin: "120px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const play = onScreen && !reduced;

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    const both = [a, b];

    if (!play) {
      for (const v of both) {
        v.pause();
        v.style.opacity = "0";
      }
      return;
    }

    /** The one currently showing; the other is armed to take over. */
    let live = a;
    let handingOver = false;

    const start = (v: HTMLVideoElement) => {
      v.currentTime = 0;
      v.style.opacity = "1";
      void v.play().catch(() => {
        /* Autoplay refused — the still underneath is the right picture. */
      });
    };

    const onTime = (e: Event) => {
      const v = e.currentTarget as HTMLVideoElement;
      if (v !== live || handingOver) return;
      const d = v.duration;
      if (!Number.isFinite(d)) return;
      if (v.currentTime < d - FADE) return;

      handingOver = true;
      const next = v === a ? b : a;
      start(next);
      v.style.opacity = "0";
      live = next;
      /* Re-arm only after the dissolve has finished, so the outgoing element
         is idle before it is asked to run again. */
      window.setTimeout(() => {
        v.pause();
        handingOver = false;
      }, FADE * 1000);
    };

    const onReady = (e: Event) => {
      const v = e.currentTarget as HTMLVideoElement;
      if (v === live) v.style.opacity = "1";
    };

    for (const v of both) {
      v.addEventListener("timeupdate", onTime);
      v.addEventListener("loadeddata", onReady);
    }
    start(a);

    return () => {
      for (const v of both) {
        v.removeEventListener("timeupdate", onTime);
        v.removeEventListener("loadeddata", onReady);
        v.pause();
      }
    };
  }, [play]);

  const layer =
    "absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity ease-linear";

  return (
    <div ref={ref} className={className} aria-hidden>
      {/* Frame zero, always painted, and the whole picture under reduced
          motion or a refused autoplay. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${poster})` }}
      />
      <video
        ref={aRef}
        src={play ? src : undefined}
        preload="none"
        muted
        playsInline
        className={layer}
        style={{ transitionDuration: `${FADE}s` }}
      />
      <video
        ref={bRef}
        src={play ? src : undefined}
        preload="none"
        muted
        playsInline
        className={layer}
        style={{ transitionDuration: `${FADE}s` }}
      />
    </div>
  );
}
