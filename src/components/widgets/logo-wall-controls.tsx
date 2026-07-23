"use client";

import {
  LOGO_MOTION_OPTIONS,
  type LogoMotion,
  type LogoSize,
} from "@/features/widgets/logo-motion";
import type { LogoWallLabel } from "@/features/widgets/logo-wall";
import { LogoWallPicker } from "@/components/widgets/logo-wall-picker";
import type {
  LogoWallEntry,
  LogoWallPendingInvite,
} from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

type Props = {
  label: LogoWallLabel;
  onLabel: (v: LogoWallLabel) => void;
  motion: LogoMotion;
  onMotion: (v: LogoMotion) => void;
  size: LogoSize;
  onSize: (v: LogoSize) => void;
  mono: boolean;
  onMono: (v: boolean) => void;
  height: number;
  confirmed: LogoWallEntry[];
  pending: LogoWallPendingInvite[];
  excludedIds: string[];
};

export function LogoWallControls({
  label,
  onLabel,
  motion,
  onMotion,
  size,
  onSize,
  mono,
  onMono,
  height,
  confirmed,
  pending,
  excludedIds,
}: Props) {
  return (
    <>
      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
          Motion
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {LOGO_MOTION_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onMotion(opt.id)}
              className={cn(
                "rounded-xl border px-2.5 py-2 text-left transition-colors",
                motion === opt.id
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-surface text-ink hover:border-plus/40",
              )}
            >
              <span className="block text-[12px] font-semibold">{opt.name}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[10px] leading-snug",
                  motion === opt.id ? "text-white/65" : "text-plus",
                )}
              >
                {opt.hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
          Logo size
        </p>
        <div className="mt-2 flex gap-1.5 rounded-xl border border-line bg-paper/60 p-1">
          {(["sm", "md", "lg", "xl"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSize(s)}
              className={cn(
                "h-9 flex-1 rounded-lg text-[12px] font-semibold uppercase transition-colors",
                size === s
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
          Label
        </p>
        <select
          value={label}
          onChange={(e) => onLabel(e.target.value as LogoWallLabel)}
          className="mt-2 h-11 w-full rounded-xl border border-line bg-surface px-3 text-[13px] text-ink"
        >
          <option value="both">Verified partners &amp; clients</option>
          <option value="partners">Our verified partners</option>
          <option value="clients">Trusted by</option>
          <option value="none">No label</option>
        </select>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-3 py-3">
        <input
          type="checkbox"
          className="mt-1"
          checked={mono}
          onChange={(e) => onMono(e.target.checked)}
        />
        <span>
          <span className="block text-[13px] font-semibold text-ink">
            Monochrome logos
          </span>
          <span className="mt-0.5 block text-[12px] text-muted">
            Flat black/white marks — no color noise, no tile backgrounds.
          </span>
        </span>
      </label>

      <LogoWallPicker
        confirmed={confirmed}
        pending={pending}
        excludedIds={excludedIds}
      />
      <p className="text-[12px] text-plus">
        Height: {height}px · transparent embed
      </p>
    </>
  );
}
