"use client";

import { useState } from "react";
import {
  ASSESSMENT_STRENGTHS,
  STRENGTH_LABELS,
  type AssessmentSourceType,
} from "@/features/assessments/catalog";
import { submitClientAssessment } from "@/features/assessments/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Props = {
  sourceType: AssessmentSourceType;
  sourceId: string;
  providerName: string;
  providerSlug?: string;
  returnTo: string;
};

export function AssessmentForm({
  sourceType,
  sourceId,
  providerName,
  providerSlug,
  returnTo,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [would, setWould] = useState<"yes" | "no" | "">("");

  function toggle(key: string) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  return (
    <form
      action={submitClientAssessment}
      className="rounded-[24px] border border-line bg-surface px-5 py-6 sm:px-7"
    >
      <input type="hidden" name="source_type" value={sourceType} />
      <input type="hidden" name="source_id" value={sourceId} />
      <input type="hidden" name="return_to" value={returnTo} />
      {providerSlug ? (
        <input type="hidden" name="provider_slug" value={providerSlug} />
      ) : null}
      {would ? <input type="hidden" name="would_work_again" value={would} /> : null}
      {selected.map((key) => (
        <input key={key} type="hidden" name="strengths" value={key} />
      ))}

      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Optional · 30 seconds
      </p>
      <h2 className="mt-2 font-display text-[clamp(1.35rem,2.8vw,1.75rem)] font-medium tracking-[-0.035em] text-ink">
        Help others know what to expect
      </h2>
      <p className="mt-2 text-[13px] text-ink-soft">
        No star ratings. Strengths are public; private notes are shared
        anonymously with {providerName} only.
      </p>

      <p className="mt-5 text-[12px] font-medium text-ink">What stood out?</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {ASSESSMENT_STRENGTHS.map((key) => {
          const on = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                on
                  ? "border-[#1f6b5c] bg-[#1f6b5c]/10 text-[#1f6b5c]"
                  : "border-line bg-white text-ink-soft hover:border-ink/25",
              )}
            >
              {STRENGTH_LABELS[key]}
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-[12px] font-medium text-ink">
        Would you work with them again?
      </p>
      <div className="mt-2.5 flex gap-2">
        {(
          [
            ["yes", "Yes"],
            ["no", "No"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setWould((prev) => (prev === value ? "" : value))}
            className={cn(
              "rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors",
              would === value
                ? "border-[#1f6b5c] bg-[#1f6b5c]/10 text-[#1f6b5c]"
                : "border-line bg-white text-ink-soft hover:border-ink/25",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="mt-5 block">
        <span className="text-[12px] font-medium text-ink">
          Anything they could improve?{" "}
          <span className="font-normal text-muted">
            (private — only {providerName} sees this, anonymously)
          </span>
        </span>
        <textarea
          name="private_feedback"
          rows={2}
          placeholder="Optional"
          className="mt-2 min-h-[4.5rem] w-full resize-none rounded-xl border border-line bg-[#f7f8fa] px-3.5 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-muted focus:border-[#1f6b5c] focus:bg-white focus:ring-2 focus:ring-[rgba(31,107,92,0.15)]"
        />
      </label>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button type="submit" className="h-11 flex-1">
          Submit
        </Button>
        <Button
          href={`${returnTo}${returnTo.includes("?") ? "&" : "?"}done=confirmed&skipped=1`}
          variant="secondary"
          className="h-11 flex-1"
        >
          Skip
        </Button>
      </div>
    </form>
  );
}
