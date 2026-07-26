"use client";

import { useEffect, useRef, useState } from "react";
import { LogoWallMarkLink } from "@/components/embed/logo-wall-mark-link";
import { useLogoWallActive } from "@/components/embed/use-logo-wall-active";
import {
  batchSwapIds,
  initialSwapCells,
  randomSwapOneId,
  shuffleIndices,
} from "@/components/embed/logo-motion-swap-logic";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import {
  LOGO_SIZE_PX,
  LOGO_SWAP_CELLS,
  type LogoSize,
} from "@/features/widgets/logo-motion";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";

type Props = {
  entries: LogoWallEntry[];
  siteUrl: string;
  theme: EmbedTheme;
  size: LogoSize;
  mode: "swap-batch" | "swap-random";
  cells?: number;
  ownerCompanyId: string;
  viaHost?: string | null;
  mono?: boolean;
};

/**
 * Fixed-cell swap grid. Falls back to static when entries <= cells.
 * Never shows the same logo twice; never swaps a cell to its last logo.
 */
export function LogoMotionSwap({
  entries,
  siteUrl,
  theme,
  size,
  mode,
  cells = LOGO_SWAP_CELLS,
  ownerCompanyId,
  viaHost,
}: Props) {
  const rootRef = useRef<HTMLUListElement | null>(null);
  const active = useLogoWallActive(rootRef);
  const px = LOGO_SIZE_PX[size];
  const pool = entries;
  const canSwap = pool.length > cells;

  const [cellIds, setCellIds] = useState(() => initialSwapCells(pool, cells));
  const prevRef = useRef<string[]>(cellIds);

  useEffect(() => {
    if (!canSwap || !active) return;

    if (mode === "swap-batch") {
      const id = window.setInterval(() => {
        setCellIds((cur) => {
          const next = batchSwapIds(pool, cur, prevRef.current);
          prevRef.current = cur;
          return next;
        });
      }, 3200);
      return () => window.clearInterval(id);
    }

    const timers: number[] = [];
    const schedule = (cellIndex: number) => {
      const delay = 1800 + Math.random() * 2800;
      const t = window.setTimeout(() => {
        setCellIds((cur) => {
          const next = randomSwapOneId(pool, cur, cellIndex, prevRef.current);
          prevRef.current = cur;
          return next;
        });
        schedule(cellIndex);
      }, delay);
      timers.push(t);
    };

    const nSwap = Math.min(cells, 2 + Math.floor(Math.random() * 3));
    for (const i of shuffleIndices(cells).slice(0, nSwap)) schedule(i);

    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [canSwap, active, mode, pool, cells]);

  const shown = canSwap
    ? cellIds.map((id) => pool.find((e) => e.id === id)).filter(Boolean)
    : pool.slice(0, cells);

  return (
    <ul
      ref={rootRef}
      className="grid w-full grid-cols-3 gap-x-6 gap-y-5 sm:grid-cols-5"
    >
      {shown.map((e) =>
        e ? (
          <li
            key={e.id}
            className="flex items-center justify-center"
            style={{ height: px + 8, width: "100%" }}
          >
            <span
              className="flex items-center justify-center overflow-hidden"
              style={{ height: px, maxWidth: "100%", width: "100%" }}
            >
              <LogoWallMarkLink
                entry={e}
                siteUrl={siteUrl}
                theme={theme}
                size={size}
                ownerCompanyId={ownerCompanyId}
                viaHost={viaHost}
              />
            </span>
          </li>
        ) : null,
      )}
    </ul>
  );
}
