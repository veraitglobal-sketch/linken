"use client";

import { LazyEmbedPreview } from "@/components/widgets/lazy-embed-preview";
import { PreviewStage } from "@/components/widgets/preview-stage";
import { WidgetConfigAside } from "@/components/widgets/widget-config-aside";
import { WidgetSegmented } from "@/components/widgets/widget-segmented";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/cn";

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
  viewport: "desktop" | "mobile";
  onViewport: (v: "desktop" | "mobile") => void;
  previewSrc: string;
  height: number;
  proLocked: boolean;
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
  onClose: () => void;
  onGetCode: () => void;
};

export function WidgetConfigureStep(props: Props) {
  const {
    widget,
    viewport,
    onViewport,
    previewSrc,
    height,
    proLocked,
    stageBg,
    onClose,
    onGetCode,
  } = props;
  const stageWidth = viewport === "mobile" ? 375 : "100%";

  return (
    <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="min-h-0 overflow-y-auto">
        <WidgetConfigAside {...props} />
      </div>

      <div className="flex min-h-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
              Live preview
            </p>
            <WidgetSegmented
              value={viewport}
              options={[
                { id: "desktop", label: "Desktop" },
                { id: "mobile", label: "Mobile" },
              ]}
              onChange={onViewport}
              compact
            />
          </div>

          <PreviewStage
            color={stageBg}
            className={cn(
              "mt-3 min-h-[220px] flex-1",
              widget.id === "compact" ? "items-center" : "items-start",
            )}
          >
            <div
              className="overflow-hidden rounded-xl transition-[width] duration-200"
              style={{ width: stageWidth, maxWidth: "100%" }}
            >
              <LazyEmbedPreview
                key={previewSrc}
                src={previewSrc}
                height={height}
                title={`${widget.name} live preview`}
                className="rounded-xl bg-transparent"
                eager
              />
            </div>
            {proLocked ? (
              <span className="pointer-events-none absolute right-5 bottom-5 rounded-md bg-navy-deep/80 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-white uppercase">
                Pro preview
              </span>
            ) : null}
          </PreviewStage>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-paper/40 px-5 py-3.5 sm:px-6">
          <Button type="button" variant="ghost" className="h-10" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="h-10 px-5" onClick={onGetCode}>
            Get code
          </Button>
        </div>
      </div>
    </div>
  );
}
