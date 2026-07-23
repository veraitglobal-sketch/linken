"use client";

import { LazyEmbedPreview } from "@/components/widgets/lazy-embed-preview";
import { PreviewStage } from "@/components/widgets/preview-stage";
import { WidgetConfigAside } from "@/components/widgets/widget-config-aside";
import { WidgetSegmented } from "@/components/widgets/widget-segmented";
import { Button } from "@/components/ui/button";
import type { WidgetDefinition, WidgetTheme } from "@/features/widgets/catalog";
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
    theme,
    onTheme,
    widthMode,
    onWidthMode,
    widthPx,
    onWidthPx,
    onStageBg,
  } = props;
  const stageWidth = viewport === "mobile" ? 375 : "100%";

  return (
    <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="min-h-0 overflow-y-auto">
        <WidgetConfigAside
          theme={theme}
          onTheme={onTheme}
          widthMode={widthMode}
          onWidthMode={onWidthMode}
          widthPx={widthPx}
          onWidthPx={onWidthPx}
          stageBg={stageBg}
          onStageBg={onStageBg}
          height={height}
        />
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
            />
          </div>

          <PreviewStage
            color={stageBg ?? (theme === "dark" ? "#081412" : null)}
            className={cn("mt-4 min-h-[220px] items-center justify-center")}
          >
            <div
              className={cn(viewport === "mobile" && "mx-auto")}
              style={{ width: stageWidth, maxWidth: "100%" }}
            >
              <LazyEmbedPreview
                src={previewSrc}
                height={height}
                title={`${widget.name} preview`}
                className="w-full bg-transparent"
                eager
              />
            </div>
          </PreviewStage>

          {proLocked ? (
            <p className="mt-4 rounded-xl border border-line bg-paper px-4 py-3 text-[13px] text-muted">
              Pro widget —{" "}
              <a href="/dashboard/billing" className="font-semibold text-ink underline-offset-2 hover:underline">
                upgrade on Billing
              </a>{" "}
              to copy embed code. Preview uses your live profile data.
            </p>
          ) : null}
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onGetCode} disabled={proLocked}>
            Get embed code
          </Button>
        </footer>
      </div>
    </div>
  );
}
