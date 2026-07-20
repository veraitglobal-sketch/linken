"use client";

import { LogoWallControls } from "@/components/widgets/logo-wall-controls";
import { WidgetSegmented } from "@/components/widgets/widget-segmented";
import { Input } from "@/components/ui/input";
import type {
  LogoMotion,
  LogoSize,
  LogoWallLabel,
  WidgetDefinition,
  WidgetTheme,
} from "@/features/widgets/catalog";
import type {
  LogoWallEntry,
  LogoWallPendingInvite,
} from "@/features/widgets/logo-wall";

type Props = {
  widget: WidgetDefinition;
  theme: WidgetTheme;
  onTheme: (t: WidgetTheme) => void;
  widthMode: "100%" | "px";
  onWidthMode: (m: "100%" | "px") => void;
  widthPx: string;
  onWidthPx: (v: string) => void;
  stageBg: string | null;
  onStageBg: (v: string | null) => void;
  height: number;
  isLogoWall: boolean;
  label: LogoWallLabel;
  onLabel: (v: LogoWallLabel) => void;
  motion: LogoMotion;
  onMotion: (v: LogoMotion) => void;
  logoSize: LogoSize;
  onLogoSize: (v: LogoSize) => void;
  mono: boolean;
  onMono: (v: boolean) => void;
  logoWallConfirmed: LogoWallEntry[];
  logoWallPending: LogoWallPendingInvite[];
  logoWallExcludedIds: string[];
};

export function WidgetConfigAside(props: Props) {
  const {
    theme,
    onTheme,
    widthMode,
    onWidthMode,
    widthPx,
    onWidthPx,
    stageBg,
    onStageBg,
    height,
    isLogoWall,
  } = props;

  return (
    <aside className="space-y-5 border-b border-line bg-paper/30 px-5 py-5 sm:px-6 lg:border-r lg:border-b-0">
      <WidgetSegmented
        label="Theme"
        value={theme}
        options={[
          { id: "light", label: "Light" },
          { id: "dark", label: "Dark" },
        ]}
        onChange={onTheme}
      />

      {isLogoWall ? (
        <LogoWallControls
          label={props.label}
          onLabel={props.onLabel}
          motion={props.motion}
          onMotion={props.onMotion}
          size={props.logoSize}
          onSize={props.onLogoSize}
          mono={props.mono}
          onMono={props.onMono}
          height={height}
          confirmed={props.logoWallConfirmed}
          pending={props.logoWallPending}
          excludedIds={props.logoWallExcludedIds}
        />
      ) : null}

      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
          Width
        </p>
        <div className="mt-2 flex gap-2">
          <select
            value={widthMode}
            onChange={(e) => onWidthMode(e.target.value as "100%" | "px")}
            className="h-11 rounded-xl border border-line bg-surface px-3 text-[13px] text-ink"
          >
            <option value="100%">100%</option>
            <option value="px">Fixed px</option>
          </select>
          {widthMode === "px" ? (
            <Input
              value={widthPx}
              onChange={(e) => onWidthPx(e.target.value.replace(/[^\d]/g, ""))}
              className="h-11"
              aria-label="Width in pixels"
            />
          ) : null}
        </div>
        {!isLogoWall ? (
          <p className="mt-2 text-[12px] text-plus">Height fixed at {height}px</p>
        ) : null}
      </div>

      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
          Preview background
        </p>
        <p className="mt-1 text-[12px] text-muted">
          Site mock only — does not change the embed.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="color"
            value={stageBg ?? "#f1f3f1"}
            onChange={(e) => onStageBg(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-surface p-1"
            aria-label="Site background color"
          />
          <span className="font-mono text-[12px] text-ink">
            {stageBg ?? "Checkerboard"}
          </span>
          {stageBg ? (
            <button
              type="button"
              onClick={() => onStageBg(null)}
              className="text-[11px] font-semibold text-ink underline-offset-2 hover:underline"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
