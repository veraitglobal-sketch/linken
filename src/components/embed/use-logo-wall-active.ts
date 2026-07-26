"use client";

import { useEffect, useState, type RefObject } from "react";

/** Pause logo wall motion when tab hidden, off-screen, or reduced-motion. */
export function useLogoWallActive(rootRef: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const el = rootRef.current;
    let visible = true;
    let docVisible = document.visibilityState === "visible";

    const sync = () => {
      setActive(!reduced.matches && docVisible && visible);
    };

    const onVis = () => {
      docVisible = document.visibilityState === "visible";
      sync();
    };
    const onReduced = () => sync();

    document.addEventListener("visibilitychange", onVis);
    reduced.addEventListener("change", onReduced);

    let io: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => {
          visible = entry?.isIntersecting !== false;
          sync();
        },
        { threshold: 0.05 },
      );
      io.observe(el);
    }

    sync();
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      reduced.removeEventListener("change", onReduced);
      io?.disconnect();
    };
  }, [rootRef]);

  return active;
}
