import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Generated plates, one per dark section, so no two chapters repeat. */
const PLATES = {
  a: "bg-[url('/images/section-plate-a.webp')]",
  b: "bg-[url('/images/screen-plate.webp')]",
} as const;

/**
 * A stage for a product composition to sit on.
 *
 * Retell's sections never put a screenshot on bare paper — it sits on a plate
 * with generous padding and the copy lives outside it. Their plates are image
 * files (`bg-secondary-2.webp`), not CSS gradients, which is what gives the
 * screenshot somewhere to land. Ours are generated in navy/mint, never the
 * purple theirs use.
 *
 * `light` is a flat band, not an image: Retell's own light stages are flat
 * `#f5f5fa`, and a generated pale plate came back as botanical stock — the
 * wrong register for a register of confirmed work.
 *
 * Radius stays on the Hansala scale (28–32px) rather than Retell's 6px.
 * Matching that would be a copy, not a translation.
 */
export function SectionPlate({
  tone = "dark",
  plate = "a",
  className,
  children,
}: {
  tone?: "dark" | "light";
  plate?: keyof typeof PLATES;
  className?: string;
  children: ReactNode;
}) {
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-chapter p-5 sm:rounded-hero sm:p-10 lg:p-14",
        dark
          ? "mark-stage shadow-chapter"
          : "bg-mute ring-1 ring-line/60 ring-inset",
        className,
      )}
    >
      {dark ? (
        <>
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-cover bg-center",
              PLATES[plate],
            )}
            aria-hidden
          />
          <div
            className="stage-grain pointer-events-none absolute inset-0 opacity-30"
            aria-hidden
          />
        </>
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}
