"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { WidgetCodeStep } from "@/components/widgets/widget-code-step";
import { WidgetConfigureStep } from "@/components/widgets/widget-configure-step";
import { useWidgetStudio } from "@/components/widgets/use-widget-studio";
import type { WidgetDefinition } from "@/features/widgets/catalog";
import { trackEmbedCreated } from "@/features/product-analytics/embed-actions";
import { cn } from "@/lib/cn";

type Props = {
  widget: WidgetDefinition;
  siteUrl: string;
  slug: string;
  isPro: boolean;
  domainReady: boolean;
  onClose: () => void;
};

type Step = "configure" | "code";

export function WidgetConfigurator({
  widget,
  siteUrl,
  slug,
  isPro,
  domainReady,
  onClose,
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("configure");
  const [copied, setCopied] = useState(false);
  const studio = useWidgetStudio(widget, siteUrl, slug);
  const proLocked = Boolean(widget.pro && !isPro);

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
    await navigator.clipboard.writeText(studio.snippet);
    void trackEmbedCreated(widget.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-deep/55 px-3 py-3 backdrop-blur-[2px] sm:items-center sm:px-4"
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
        className="linken-panel-enter flex max-h-[min(92vh,880px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_80px_rgba(10,20,18,0.28)]"
      >
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <StepPill active={step === "configure"}>1 · Configure</StepPill>
              <span className="text-plus">/</span>
              <StepPill active={step === "code"}>2 · Code</StepPill>
            </div>
            <h2
              id={titleId}
              className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink"
            >
              {widget.name}
            </h2>
            <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-muted">
              {widget.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-muted hover:bg-paper hover:text-ink"
          >
            Close
          </button>
        </header>

        {step === "configure" ? (
          <WidgetConfigureStep
            widget={widget}
            theme={studio.theme}
            onTheme={studio.setTheme}
            widthMode={studio.widthMode}
            onWidthMode={studio.setWidthMode}
            widthPx={studio.widthPx}
            onWidthPx={studio.setWidthPx}
            stageBg={studio.stageBg}
            onStageBg={studio.setStageBg}
            viewport={studio.viewport}
            onViewport={studio.setViewport}
            previewSrc={studio.previewSrc}
            height={studio.height}
            proLocked={proLocked}
            onClose={onClose}
            onGetCode={() => setStep("code")}
          />
        ) : (
          <WidgetCodeStep
            proLocked={proLocked}
            domainReady={domainReady}
            tokens={studio.tokens}
            copied={copied}
            onCopy={copy}
            onBack={() => setStep("configure")}
            onDone={onClose}
          />
        )}
      </div>
    </div>
  );
}

function StepPill({
  active,
  children,
}: {
  active: boolean;
  children: string;
}) {
  return (
    <span
      className={cn(
        "text-[10px] font-semibold tracking-[0.1em] uppercase",
        active ? "text-blue" : "text-plus",
      )}
    >
      {children}
    </span>
  );
}
