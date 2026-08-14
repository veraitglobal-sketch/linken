"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

/** Seconds of dissolve before the loop point. */
const FADE = 0.7;

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
 * A still that becomes a slow loop once it is worth it.
 *
 * The loop is 3.2 MB, so it must never touch first paint. `preload="none"`
 * plus a `src` attached only once the plate is on screen means the file is
 * not fetched at all until it can be seen — and never for a visitor who asked
 * for reduced motion, who keeps the still.
 *
 * The generated clip does not end where it starts, so a plain `loop` shows a
 * jump cut. The poster *is* frame zero, so the clip dissolves into the still
 * just before the loop point and comes back out of it: the seam lands on an
 * identical image and reads as a breath rather than a cut.
 *
 * Opacity is driven by two states and a CSS transition, not by a per-frame
 * ramp. A ramp computed from `duration` leaves the video invisible for as
 * long as `duration` is `NaN` — which, with `preload="none"`, is exactly the
 * moment it starts.
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
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
    const v = videoRef.current;
    if (!v) return;

    if (!play) {
      v.pause();
      v.style.opacity = "0";
      return;
    }

    const show = () => {
      v.style.opacity = "1";
    };
    /* Only dip out near the loop point; if duration is not known yet the clip
       simply stays visible, which is the correct fallback. */
    const onTime = () => {
      const d = v.duration;
      if (!Number.isFinite(d) || d <= FADE * 2) return;
      v.style.opacity = v.currentTime > d - FADE ? "0" : "1";
    };

    v.addEventListener("playing", show);
    v.addEventListener("loadeddata", show);
    v.addEventListener("timeupdate", onTime);
    void v.play().catch(() => {
      /* Autoplay refused — the still underneath is already the right picture. */
    });

    return () => {
      v.removeEventListener("playing", show);
      v.removeEventListener("loadeddata", show);
      v.removeEventListener("timeupdate", onTime);
    };
  }, [play]);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`} aria-hidden>
      {/* Frame zero, always painted: the loop dissolves through this. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${poster})` }}
      />
      <video
        ref={videoRef}
        src={play ? src : undefined}
        preload="none"
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-700 ease-out"
      />
    </div>
  );
}
