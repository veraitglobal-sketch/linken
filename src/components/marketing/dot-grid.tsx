import { cn } from "@/lib/cn";

/**
 * The testimonial ground: one grid, some of it in colour.
 *
 * Three radial layers on a single 12px raster. The tinted sizes and offsets are
 * exact multiples of it, so a mint or deep-green dot always lands on a node of
 * the base grid — it reads as part of the grid being coloured rather than as a
 * second pattern laid over the first. A smaller dot at a higher alpha reads as
 * sharp; a bigger dot at a low alpha only reads as smudge.
 *
 * Both tints are ours (`--blue-soft`, `--blue`). The reference grid this was
 * drawn against is violet and cyan because that is somebody else's palette;
 * borrowing it would put a colour on the page that exists nowhere else in the
 * product.
 *
 * Extracted from `home-proof-wall`, which had it inline, so the profile and the
 * marketing wall cannot drift apart. Worth a second opinion that mint is spread
 * this thin — AGENTS.md keeps it for the mark and one accent, and this is
 * texture rather than an accent, which is a reading rather than a rule.
 */
export function DotGrid({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: [
          "radial-gradient(circle at 1px 1px, rgba(126,184,164,0.95) 0.75px, transparent 0)",
          "radial-gradient(circle at 1px 1px, rgba(26,92,81,0.6) 0.7px, transparent 0)",
          "radial-gradient(circle at 1px 1px, rgba(13,18,16,0.16) 0.6px, transparent 0)",
        ].join(","),
        backgroundSize: "60px 48px, 84px 72px, 12px 12px",
        backgroundPosition: "24px 12px, 48px 36px, 0 0",
        /* Dissolves at every edge, so it is texture rather than a panel with a
           border. */
        maskImage:
          "radial-gradient(120% 80% at 50% 50%, #000 35%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(120% 80% at 50% 50%, #000 35%, transparent 100%)",
      }}
    />
  );
}
