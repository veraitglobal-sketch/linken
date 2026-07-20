"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { CodeBlock } from "@/components/developers/code-block";
import { tokenizeShell } from "@/components/developers/highlight";
import { LazyEmbedPreview } from "@/components/widgets/lazy-embed-preview";
import { LogoWallControls } from "@/components/widgets/logo-wall-controls";
import { PreviewStage } from "@/components/widgets/preview-stage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildEmbedSnippet,
  buildEmbedSrc,
  widgetHeight,
  type LogoMotion,
  type LogoSize,
  type LogoWallLabel,
  type WidgetDefinition,
  type WidgetTheme,
} from "@/features/widgets/catalog";
import type {
  LogoWallEntry,
  LogoWallPendingInvite,
} from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

type Props = {
  widget: WidgetDefinition;
  siteUrl: string;
  slug: string;
  isPro: boolean;
  onClose: () => void;
  logoWallConfirmed?: LogoWallEntry[];
  logoWallPending?: LogoWallPendingInvite[];
  logoWallExcludedIds?: string[];
};

type Step = "configure" | "code";

export function WidgetConfigurator({
  widget,
  siteUrl,
  slug,
  isPro,
  onClose,
  logoWallConfirmed = [],
  logoWallPending = [],
  logoWallExcludedIds = [],
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("configure");
  const [theme, setTheme] = useState<WidgetTheme>("light");
  const [widthMode, setWidthMode] = useState<"100%" | "px">("100%");
  const [widthPx, setWidthPx] = useState("320");
  /** null = checkerboard transparency stage */
  const [stageBg, setStageBg] = useState<string | null>(null);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [label, setLabel] = useState<LogoWallLabel>("both");
  const [mono, setMono] = useState(true);
  const [motion, setMotion] = useState<LogoMotion>("row");
  const [logoSize, setLogoSize] = useState<LogoSize>("md");

  const isLogoWall = widget.id === "logo-wall";
  const proLocked = Boolean(widget.pro && !isPro);

  const width = widthMode === "100%" ? "100%" : `${widthPx || "320"}px`;
  const height = widgetHeight(widget.id, {
    motion: isLogoWall ? motion : undefined,
    size: isLogoWall ? logoSize : undefined,
  });

  const previewSrc = useMemo(
    () =>
      buildEmbedSrc({
        siteUrl,
        slug,
        variant: widget.id,
        theme,
        width: widthMode === "100%" ? undefined : widthPx,
        preview: true,
        label: isLogoWall ? label : undefined,
        mono: isLogoWall ? mono : undefined,
        motion: isLogoWall ? motion : undefined,
        size: isLogoWall ? logoSize : undefined,
      }),
    [
      siteUrl,
      slug,
      widget.id,
      theme,
      widthMode,
      widthPx,
      isLogoWall,
      label,
      mono,
      motion,
      logoSize,
    ],
  );

  const snippet = useMemo(
    () =>
      buildEmbedSnippet({
        siteUrl,
        slug,
        variant: widget.id,
        theme,
        width,
        label: isLogoWall ? label : undefined,
        mono: isLogoWall ? mono : undefined,
        motion: isLogoWall ? motion : undefined,
        size: isLogoWall ? logoSize : undefined,
      }),
    [
      siteUrl,
      slug,
      widget.id,
      theme,
      width,
      isLogoWall,
      label,
      mono,
      motion,
      logoSize,
    ],
  );

  const tokens = useMemo(() => tokenizeShell(snippet), [snippet]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [onKeyDown]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    function trap(e: KeyboardEvent) {
      if (e.key !== "Tab" || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    panel.addEventListener("keydown", trap);
    return () => panel.removeEventListener("keydown", trap);
  }, [step]);

  async function copy() {
    if (proLocked) return;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const stageWidth = viewport === "mobile" ? 375 : "100%";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#081412]/55 px-3 py-3 backdrop-blur-[2px] sm:items-center sm:px-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[min(92vh,880px)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_24px_80px_rgba(10,20,18,0.28)]"
      >
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-[#94a3b8] uppercase">
              Widget studio
            </p>
            <h2
              id={titleId}
              className="mt-1 font-display text-xl font-medium tracking-[-0.03em] text-ink"
            >
              {step === "configure" ? widget.name : "Get code"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-[#64748b] hover:bg-[#f4f6f9] hover:text-ink"
          >
            Close
          </button>
        </header>

        {step === "configure" ? (
          <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="space-y-5 border-b border-line px-5 py-5 lg:border-r lg:border-b-0 sm:px-6">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
                  About
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748b]">
                  {widget.description}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
                  Theme
                </p>
                <div className="mt-2 flex gap-1.5 rounded-xl border border-line bg-[#f7f8fa] p-1">
                  {(["light", "dark"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={cn(
                        "h-9 flex-1 rounded-lg text-[12px] font-semibold capitalize transition-colors",
                        theme === t
                          ? "bg-white text-ink shadow-sm"
                          : "text-[#64748b] hover:text-ink",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {isLogoWall ? (
                <LogoWallControls
                  label={label}
                  onLabel={setLabel}
                  motion={motion}
                  onMotion={setMotion}
                  size={logoSize}
                  onSize={setLogoSize}
                  mono={mono}
                  onMono={setMono}
                  height={height}
                  confirmed={logoWallConfirmed}
                  pending={logoWallPending}
                  excludedIds={logoWallExcludedIds}
                />
              ) : null}

              <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
                  Width
                </p>
                <div className="mt-2 flex gap-2">
                  <select
                    value={widthMode}
                    onChange={(e) =>
                      setWidthMode(e.target.value as "100%" | "px")
                    }
                    className="h-11 rounded-xl border border-[#e6eaf0] bg-white px-3 text-[13px] text-ink"
                  >
                    <option value="100%">100%</option>
                    <option value="px">Fixed px</option>
                  </select>
                  {widthMode === "px" ? (
                    <Input
                      value={widthPx}
                      onChange={(e) =>
                        setWidthPx(e.target.value.replace(/[^\d]/g, ""))
                      }
                      className="h-11"
                      aria-label="Width in pixels"
                    />
                  ) : null}
                </div>
                {!isLogoWall ? (
                  <p className="mt-2 text-[12px] text-[#94a3b8]">
                    Height: {height}px (fixed for this widget)
                  </p>
                ) : null}
              </div>

              <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
                  Background
                </p>
                <p className="mt-1 text-[12px] text-[#64748b]">
                  Preview on your site&apos;s background — does not change the
                  widget. Default is a transparency checkerboard.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="color"
                    value={stageBg ?? "#f8fafc"}
                    onChange={(e) => setStageBg(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-white p-1"
                    aria-label="Site background color"
                  />
                  <span className="font-mono text-[12px] text-[#64748b]">
                    {stageBg ?? "Checkerboard"}
                  </span>
                  {stageBg ? (
                    <button
                      type="button"
                      onClick={() => setStageBg(null)}
                      className="text-[11px] font-semibold text-[#64748b] underline-offset-2 hover:text-ink hover:underline"
                    >
                      Reset
                    </button>
                  ) : null}
                </div>
              </div>
            </aside>

            <div className="flex min-h-0 flex-col px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
                  Live preview
                </p>
                <div className="flex gap-1 rounded-xl border border-line bg-[#f7f8fa] p-1">
                  {(["desktop", "mobile"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setViewport(v)}
                      className={cn(
                        "h-8 rounded-lg px-3 text-[11px] font-semibold capitalize transition-colors",
                        viewport === v
                          ? "bg-white text-ink shadow-sm"
                          : "text-[#64748b] hover:text-ink",
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <PreviewStage
                color={stageBg}
                className={cn(
                  "mt-3 min-h-[200px]",
                  widget.id === "compact" ? "items-center" : "items-start",
                )}
              >
                <div
                  className="overflow-hidden rounded-xl transition-[width] duration-200"
                  style={{
                    width: stageWidth,
                    maxWidth: "100%",
                  }}
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
                  <span className="pointer-events-none absolute right-5 bottom-5 rounded-md border border-white/30 bg-[#081412]/75 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-white uppercase">
                    Pro preview
                  </span>
                ) : null}
              </PreviewStage>

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="h-10 px-5"
                  onClick={() => setStep("code")}
                >
                  Get code
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5 sm:px-6">
            {proLocked ? (
              <div className="rounded-2xl border border-line bg-[#f7f8fa] px-5 py-8 text-center">
                <p className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
                  Available on Pro
                </p>
                <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-[#64748b]">
                  Logo wall is a presentation tool for Pro. Your confirmed
                  partners and clients stay free on your public profile.
                </p>
                <p className="mt-4 text-[12px] font-semibold tracking-[0.08em] text-[#94a3b8] uppercase">
                  Pro coming soon
                </p>
              </div>
            ) : (
              <>
                <p className="text-[13px] leading-relaxed text-[#64748b]">
                  Paste this iframe on your site. The widget links back to your
                  Linken profile and counts as your website backlink
                  verification.
                </p>

                <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#081412]">
                  <button
                    type="button"
                    onClick={copy}
                    className="absolute top-2 right-2 z-10 rounded-lg border border-white/15 bg-[#081412]/90 px-2.5 py-1.5 text-[11px] font-semibold text-white/70 transition-colors hover:border-white/30 hover:text-white"
                  >
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                  <CodeBlock
                    tokens={tokens}
                    className="overflow-x-auto px-4 py-4 pr-20 font-mono text-[12px] leading-relaxed"
                  />
                </div>
              </>
            )}

            <div className="mt-4 flex flex-wrap justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                className="h-10"
                onClick={() => setStep("configure")}
              >
                Back
              </Button>
              <div className="flex gap-2">
                {!proLocked ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-10"
                    onClick={copy}
                  >
                    {copied ? "Copied ✓" : "Copy code"}
                  </Button>
                ) : null}
                <Button type="button" className="h-10 px-5" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
