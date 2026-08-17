"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { TestimonialStudioEntry } from "@/features/testimonials/queries";
import { toggleTestimonialIncluded } from "@/features/testimonials/testimonials-studio-actions";
import { cn } from "@/lib/cn";

type Props = {
  entry: TestimonialStudioEntry;
  /** Draw the capacity line above this row — it is the first one past the cut. */
  cutBefore?: boolean;
  cutLabel?: string;
  onDragStart: () => void;
  onDrop: () => void;
};

export function TestimonialsStudioRow({
  entry,
  cutBefore,
  cutLabel,
  onDragStart,
  onDrop,
}: Props) {
  const router = useRouter();
  const [included, setIncluded] = useState(entry.included);
  const [, startTransition] = useTransition();

  function onToggle() {
    const next = !included;
    setIncluded(next);
    startTransition(async () => {
      await toggleTestimonialIncluded(entry.id, next);
      router.refresh();
    });
  }

  const preview =
    entry.body.length > 160 ? `${entry.body.slice(0, 160).trim()}…` : entry.body;

  return (
    <>
      {cutBefore ? (
        /* Not a row and not draggable — a rule across the list with the count
           on it. `aria-hidden` because the same fact is already on every row
           below it as "Below cut — hidden in embed", and a screen reader does
           not need the decoration twice. */
        <li aria-hidden className="flex items-center gap-3 px-4 pt-4 pb-1 sm:px-5">
          <span className="h-px flex-1 bg-line" />
          <span className="shrink-0 text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
            {cutLabel}
          </span>
          <span className="h-px flex-1 bg-line" />
        </li>
      ) : null}
    <li
      className={cn(
        "flex flex-wrap items-start gap-3 px-4 py-3 sm:px-5",
        entry.belowCut && entry.included && "bg-paper/80 opacity-70",
      )}
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <button
        type="button"
        className="cursor-grab pt-1 text-[12px] text-plus active:cursor-grabbing"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        ⋮⋮
      </button>
      <input
        type="checkbox"
        checked={included}
        onChange={onToggle}
        className="mt-1"
        aria-label={`Include testimonial from ${entry.authorName}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-ink">
          {entry.authorName}
          {entry.authorRole ? (
            <span className="font-normal text-muted"> · {entry.authorRole}</span>
          ) : null}
        </p>
        {entry.authorCompanyName ? (
          <p className="text-[11px] text-muted">{entry.authorCompanyName}</p>
        ) : null}
        <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
          &ldquo;{preview}&rdquo;
        </p>
        {entry.belowCut && entry.included ? (
          <p className="mt-1 text-[11px] text-muted">Below cut — hidden in embed</p>
        ) : null}
      </div>
    </li>
    </>
  );
}
