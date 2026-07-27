"use client";

import { useEffect } from "react";

/** Posts iframe content height to parent (paired with /embed-resize.js). */
export function EmbedResizeReporter() {
  useEffect(() => {
    function post() {
      const height = Math.ceil(document.documentElement.scrollHeight);
      window.parent.postMessage(
        { type: "hansala-embed-resize", height },
        "*",
      );
    }
    post();
    const ro = new ResizeObserver(post);
    ro.observe(document.body);
    window.addEventListener("load", post);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", post);
    };
  }, []);

  return null;
}
