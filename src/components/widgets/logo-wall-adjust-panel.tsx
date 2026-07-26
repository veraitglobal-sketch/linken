"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { saveLogoWallAdjust } from "@/features/widgets/logo-wall-studio-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Props = {
  entry: LogoWallEntry;
  onClose: () => void;
};

export function LogoWallAdjustPanel({ entry, onClose }: Props) {
  const router = useRouter();
  const [scale, setScale] = useState(entry.scale);
  const [padding, setPadding] = useState(entry.padding);
  const [grayscale, setGrayscale] = useState(entry.grayscale);
  const [invertOnDark, setInvertOnDark] = useState(entry.invertOnDark);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await saveLogoWallAdjust(entry.id, {
        scale,
        padding,
        grayscale,
        invertOnDark,
      });
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="w-full rounded-xl border border-line bg-paper p-3 sm:min-w-[300px]">
      <p className="text-[11px] font-semibold text-ink">Adjust mark</p>
      <div
        className="mt-3 flex h-16 items-center justify-center rounded-lg border border-dashed border-line bg-surface"
        style={{ padding }}
      >
        {entry.showLogo && entry.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.logoUrl}
            alt={entry.name}
            className={cn(
              "h-10 w-auto max-w-[140px] object-contain",
              grayscale && "grayscale",
            )}
            style={{ transform: `scale(${scale})` }}
          />
        ) : (
          <span className="text-[12px] font-semibold tracking-wide text-ink">
            {entry.initials}
          </span>
        )}
      </div>
      <label className="mt-3 block text-[10px] font-semibold text-muted">
        Scale {scale.toFixed(2)}
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.05}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="mt-1 block w-full"
        />
      </label>
      <label className="mt-2 block text-[10px] font-semibold text-muted">
        Padding {padding}px
        <input
          type="range"
          min={0}
          max={24}
          step={1}
          value={padding}
          onChange={(e) => setPadding(Number(e.target.value))}
          className="mt-1 block w-full"
        />
      </label>
      <label className="mt-2 flex items-center gap-2 text-[11px] text-ink">
        <input
          type="checkbox"
          checked={grayscale}
          onChange={(e) => setGrayscale(e.target.checked)}
        />
        Grayscale
      </label>
      <label className="mt-1 flex items-center gap-2 text-[11px] text-ink">
        <input
          type="checkbox"
          checked={invertOnDark}
          onChange={(e) => setInvertOnDark(e.target.checked)}
        />
        Invert on dark theme
      </label>
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          className="h-8 text-[11px]"
          disabled={pending}
          onClick={save}
        >
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-8 text-[11px]"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
