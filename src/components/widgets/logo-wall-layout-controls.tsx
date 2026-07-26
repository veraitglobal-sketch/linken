"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  LOGO_MOTION_OPTIONS,
  type LogoMotion,
  type LogoSize,
} from "@/features/widgets/logo-motion";
import {
  saveLogoWallLimit,
  saveLogoWallMotion,
  saveLogoWallSize,
} from "@/features/widgets/logo-wall-studio-actions";
import { cn } from "@/lib/cn";

type Props = {
  limit: number;
  motion: LogoMotion;
  size: LogoSize;
  includedCount: number;
};

export function LogoWallLayoutControls({
  limit,
  motion,
  size,
  includedCount,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const showing = Math.min(limit, includedCount);

  function run(fn: () => Promise<unknown>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <div className="mt-3 space-y-3 border-t border-line pt-3">
      <p className="text-[12px] font-semibold text-ink">
        Showing {showing} of {includedCount}
        {includedCount > limit ? (
          <span className="font-normal text-muted">
            {" "}
            — drag firms you want above the cut line
          </span>
        ) : null}
      </p>
      <label className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
        Limit
        <input
          type="range"
          min={1}
          max={30}
          value={limit}
          disabled={pending}
          onChange={(e) =>
            run(() => saveLogoWallLimit(Number(e.target.value)))
          }
          className="w-40"
        />
        <span className="font-semibold text-ink">{limit}</span>
      </label>
      <div className="flex flex-wrap gap-1.5">
        {LOGO_MOTION_OPTIONS.map((m) => (
          <button
            key={m.id}
            type="button"
            title={m.hint}
            disabled={pending}
            onClick={() => run(() => saveLogoWallMotion(m.id))}
            className={cn(
              "rounded-lg border px-2 py-1 text-[10px] font-semibold",
              motion === m.id
                ? "border-ink bg-ink text-white"
                : "border-line bg-paper text-ink hover:bg-surface",
            )}
          >
            {m.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(["sm", "md", "lg", "xl"] as LogoSize[]).map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => run(() => saveLogoWallSize(s))}
            className={cn(
              "rounded-lg border px-2 py-1 text-[10px] font-semibold uppercase",
              size === s
                ? "border-ink bg-ink text-white"
                : "border-line bg-paper text-ink hover:bg-surface",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
