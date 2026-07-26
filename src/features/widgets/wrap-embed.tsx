import type { ReactNode } from "react";
import type { EmbedTheme } from "@/components/embed/embed-theme";

/** Shared iframe shell for public embeds. */
export function wrapEmbed(
  node: ReactNode,
  theme: EmbedTheme,
  w?: string,
  opts?: {
    center?: boolean;
    transparent?: boolean;
    wrapBackground?: string;
    bare?: boolean;
  },
) {
  const width =
    w && (/^\d+$/.test(w) || /^\d+%$/.test(w) || /^\d+px$/.test(w))
      ? /^\d+$/.test(w)
        ? `${w}px`
        : w
      : "100%";

  let bg: string;
  if (opts?.wrapBackground !== undefined) {
    bg = opts.wrapBackground;
  } else if (opts?.transparent || opts?.bare) {
    bg = "transparent";
  } else if (theme === "dark") {
    bg = "#081412";
  } else {
    bg = "transparent";
  }

  return (
    <div
      className={
        opts?.center
          ? "box-border flex min-h-full w-full items-center justify-center"
          : "box-border min-h-full w-full"
      }
      style={{
        width,
        maxWidth: "100%",
        background: bg,
        border: opts?.bare ? "none" : undefined,
      }}
    >
      {node}
    </div>
  );
}
