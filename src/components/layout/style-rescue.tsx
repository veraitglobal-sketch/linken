"use client";

import { useEffect, useState } from "react";

/**
 * Detects when Next/Tailwind CSS failed to apply (common in email in-app
 * browsers and stale Safari caches after deploys) and offers a hard reload.
 */
export function StyleRescue() {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const probe = () => {
      const display = getComputedStyle(document.body).display;
      // Root body uses `flex` from Tailwind — without CSS it stays `block`.
      setBroken(display !== "flex");
    };

    probe();
    const t = window.setTimeout(probe, 800);
    return () => window.clearTimeout(t);
  }, []);

  if (!broken) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        zIndex: 99999,
        left: 12,
        right: 12,
        bottom: 12,
        padding: "14px 16px",
        borderRadius: 16,
        background: "#0e1f1c",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        fontSize: 14,
        lineHeight: 1.4,
        boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
      }}
    >
      <p style={{ margin: 0 }}>
        Styles didn’t load on this browser. Reload to fix the layout.
      </p>
      <button
        type="button"
        onClick={() => {
          document.querySelectorAll('link[rel="stylesheet"]').forEach((node) => {
            const link = node as HTMLLinkElement;
            const url = new URL(link.href);
            url.searchParams.set("_r", String(Date.now()));
            link.href = url.toString();
          });
          window.location.reload();
        }}
        style={{
          marginTop: 10,
          height: 40,
          width: "100%",
          border: 0,
          borderRadius: 10,
          background: "#fff",
          color: "#0e1f1c",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        Reload page
      </button>
    </div>
  );
}
