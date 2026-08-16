import {
  SurfaceGlyph,
  type SurfaceGlyphKind,
} from "@/components/marketing/surface-glyph";
import { cn } from "@/lib/cn";

/** Same three plates as the surfaces carousel — cycled so no two rows in view
 *  carry the same one. */
const PLATES = [
  "/images/plate-ink-1.webp",
  "/images/plate-ink-2.webp",
  "/images/plate-ink-3.webp",
];

/**
 * A weighted badge, not a hairline drawing.
 *
 * The rail carried 84px line glyphs: at that size a 1.4px stroke has no mass
 * and reads as clipart. This is the treatment already used on the surfaces
 * cards — plate, white disc, solid glyph — so the two sections belong to each
 * other, and the plate is where colour enters without inventing a hue.
 *
 * The glow behind the disc is the only thing that moves: it swells on the live
 * row and settles back. Nothing changes size, so the row height is fixed and
 * the page below never shifts.
 */
export function OutcomeBadge({
  kind,
  index,
  live,
  className,
}: {
  kind: SurfaceGlyphKind;
  index: number;
  live: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-card bg-navy bg-cover bg-center transition-opacity duration-700",
        live ? "opacity-100" : "opacity-55",
        className,
      )}
      style={{ backgroundImage: `url(${PLATES[index % PLATES.length]})` }}
      aria-hidden
    >
      <span
        className={cn(
          "absolute inset-0 m-auto size-[70%] rounded-full bg-blue-soft/25 blur-xl transition-transform duration-[1200ms] ease-out",
          live ? "scale-110" : "scale-75",
        )}
      />
      <div className="absolute inset-0 grid place-items-center">
        <div
          className={cn(
            "grid size-[54%] place-items-center rounded-full bg-white/95 transition-shadow duration-700",
            live
              ? "shadow-[0_10px_28px_-8px_rgba(8,20,18,0.55)]"
              : "shadow-[0_4px_14px_-6px_rgba(8,20,18,0.4)]",
          )}
        >
          <SurfaceGlyph kind={kind} className="size-[56%]" />
        </div>
      </div>
    </div>
  );
}
