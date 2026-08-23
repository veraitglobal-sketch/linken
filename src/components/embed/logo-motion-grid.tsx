import { LogoWallMarkLink } from "@/components/embed/logo-wall-mark-link";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { LogoSize } from "@/features/widgets/logo-motion";
import { LOGO_SIZE_PX } from "@/features/widgets/logo-motion";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

type Props = {
  entries: LogoWallEntry[];
  siteUrl: string;
  theme: EmbedTheme;
  mono: boolean;
  size: LogoSize;
  ownerCompanyId: string;
  viaHost?: string | null;
};

/** Widest the grid ever goes. Below that it sheds columns, never squeezes. */
const MAX_COLUMNS = 4;

/** Horizontal padding inside a cell, both sides. Matches `px-3`. */
const CELL_PADDING = 24;

/**
 * Editorial grid — hairlines only, no card fills.
 *
 * Columns resolve from the container, never from a fixed count and never from
 * the viewport. This was `grid-cols-4`, which is the one thing a widget cannot
 * assume: it renders inside somebody else's column at a width we never learn.
 * At a 320px host container four columns left about 56px a cell, and a
 * wordmark given 56px minus padding has nowhere to go — the marks collapsed to
 * slivers and the row stopped reading as a row.
 *
 * `auto-fit` + `minmax` caps the count at four on a wide container and drops to
 * three, two and one as it narrows, so a mark is either shown at a size worth
 * showing or moved to its own line.
 */
export function LogoMotionGrid({
  entries,
  siteUrl,
  theme,
  size,
  ownerCompanyId,
  viaHost,
}: Props) {
  const shown = entries.slice(0, MAX_COLUMNS * 2);
  const line = theme === "dark" ? "border-white/12" : "border-[#e2e6e3]";

  /* The floor a cell may not go below: the widest a mark is allowed to be,
     plus the cell padding.
     `EmbedBareLogo` caps a mark at `height * 3.2` and lets `object-contain`
     shrink it to fit whatever width it is given — so a cell narrower than that
     does not clip a wide wordmark, it makes it *shorter*. That is why a
     wordmark and a square glyph side by side stopped sitting on the same line:
     one of them had been quietly scaled down. Matching this floor to the same
     3.2 means no mark ever has to shrink, and heights line up by construction
     rather than by luck. */
  const minCell = Math.round(LOGO_SIZE_PX[size] * 3.2) + CELL_PADDING;

  return (
    /* Clips the outer hairlines. Every cell draws its right and bottom border,
       which is the only rule that survives a column count nobody knows in
       advance — `col < 3` was arithmetic on an assumption. The list is a pixel
       wider and taller than this box, so the outermost lines fall outside it. */
    <div className="min-w-0 flex-1 overflow-hidden">
      <ul
        className="-mr-px -mb-px grid min-w-0"
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, max(${minCell}px, calc(100% / ${MAX_COLUMNS}))), 1fr))`,
        }}
      >
        {shown.map((e) => (
          <li
            key={e.slug}
            className={cn(
              "flex min-w-0 items-center justify-center border-r border-b px-3 py-2.5",
              line,
            )}
          >
            <LogoWallMarkLink
              entry={e}
              siteUrl={siteUrl}
              theme={theme}
              size={size}
              ownerCompanyId={ownerCompanyId}
              viaHost={viaHost}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
