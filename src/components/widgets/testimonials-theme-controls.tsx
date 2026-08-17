"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { TestimonialThemeTokens } from "@/features/testimonials/theme/presets";
import {
  PRESET_LABELS,
  TESTIMONIAL_COLUMNS,
  TESTIMONIAL_PRESETS,
} from "@/features/testimonials/theme/presets";
import {
  applyMatchedTestimonialTheme,
  matchTestimonialSiteTheme,
  saveTestimonialPreset,
  saveTestimonialThemeTokens,
} from "@/features/testimonials/testimonials-theme-actions";
import { cn } from "@/lib/cn";

type Props = {
  theme: TestimonialThemeTokens;
};

export function TestimonialsThemeControls({ theme }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [matchPreview, setMatchPreview] = useState<TestimonialThemeTokens | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  function pickPreset(preset: TestimonialThemeTokens["preset"]) {
    startTransition(async () => {
      await saveTestimonialPreset(preset);
      router.refresh();
    });
  }

  function saveFont(fontFamily: string) {
    startTransition(async () => {
      await saveTestimonialThemeTokens({ fontFamily });
      router.refresh();
    });
  }

  function saveColumns(maxColumns: TestimonialThemeTokens["maxColumns"]) {
    startTransition(async () => {
      await saveTestimonialThemeTokens({ maxColumns });
      router.refresh();
    });
  }

  function saveCustomCss(customCss: string) {
    startTransition(async () => {
      await saveTestimonialThemeTokens({ customCss });
      router.refresh();
    });
  }

  function runMatch() {
    setMatchError(null);
    startTransition(async () => {
      const result = await matchTestimonialSiteTheme();
      if (!result.ok) {
        setMatchError(result.error);
        setMatchPreview(null);
        return;
      }
      setMatchPreview(result.preview);
    });
  }

  function acceptMatch() {
    if (!matchPreview) return;
    startTransition(async () => {
      await applyMatchedTestimonialTheme(matchPreview);
      setMatchPreview(null);
      router.refresh();
    });
  }

  return (
    <div className={cn("mt-5 space-y-4 border-t border-line pt-4", pending && "opacity-70")}>
      <p className="text-[12px] font-medium text-ink">Theme</p>
      <div className="flex flex-wrap gap-2">
        {TESTIMONIAL_PRESETS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => pickPreset(id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-semibold",
              theme.preset === id
                ? "border-ink bg-ink text-paper"
                : "border-line bg-surface text-ink",
            )}
          >
            {PRESET_LABELS[id]}
          </button>
        ))}
      </div>

      <div>
        <p className="text-[12px] font-medium text-ink">Columns at most</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
          An upper bound, not a fixed count. The widget drops to fewer columns
          on its own when the space it is given is narrow, so this can never
          break a host&rsquo;s sidebar.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TESTIMONIAL_COLUMNS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => saveColumns(n)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-semibold tabular-nums",
                theme.maxColumns === n
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-surface text-ink",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-[12px] font-medium text-ink">Font family</span>
        <input
          defaultValue={theme.fontFamily}
          onBlur={(e) => {
            if (e.target.value.trim() !== theme.fontFamily) saveFont(e.target.value);
          }}
          placeholder='"Geist", ui-sans-serif, sans-serif'
          className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 text-[13px]"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={runMatch}
          className="rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-semibold text-ink"
        >
          Match my site
        </button>
        {matchError ? (
          <p className="text-[12px] text-ember">{matchError}</p>
        ) : null}
      </div>

      {matchPreview ? (
        <div className="rounded-xl border border-line bg-paper/60 p-3">
          <p className="text-[12px] font-medium text-ink">Preview from your homepage</p>
          <p className="mt-1 text-[11px] text-muted">
            Font: {matchPreview.fontFamily}
            {matchPreview.textColor ? ` · Text ${matchPreview.textColor}` : ""}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={acceptMatch}
              className="rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-paper"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setMatchPreview(null)}
              className="rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <label className="block">
        <span className="text-[12px] font-medium text-ink">Custom CSS (optional)</span>
        <textarea
          rows={3}
          defaultValue={theme.customCss}
          onBlur={(e) => {
            if (e.target.value !== theme.customCss) saveCustomCss(e.target.value);
          }}
          placeholder=".hs-tm-card { padding: 1rem; }"
          className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono text-[12px]"
        />
        <p className="mt-1 text-[11px] text-muted">
          Attribution lines cannot be hidden — Hansala enforces visible author name and date.
        </p>
      </label>
    </div>
  );
}
