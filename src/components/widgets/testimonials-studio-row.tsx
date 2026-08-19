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

  /* The whole quote. Truncating to 160 characters hid the thing being judged —
     and the layouts drop over-long quotes rather than cutting them, so knowing
     the real length is part of deciding what fits. */
  const roleLine = [entry.authorCompanyName, entry.authorRole]
    .filter(Boolean)
    .join(", ");
  const initials = (entry.authorCompanyName ?? entry.authorName)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  return (
    <>
      {cutBefore ? (
        /* Not a row and not draggable — a rule across the list with the count
           on it. `aria-hidden` because the same fact is already on every row
           below it as "Below cut", and a screen reader does not need the
           decoration twice. */
        <li aria-hidden className="flex items-center gap-3 px-4 pt-5 pb-1 sm:px-5">
          <span className="h-px flex-1 bg-line" />
          <span className="shrink-0 text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
            {cutLabel}
          </span>
          <span className="h-px flex-1 bg-line" />
        </li>
      ) : null}
      <li
        className={cn(
          "group flex items-start gap-3 px-4 py-4 sm:px-5",
          entry.belowCut && entry.included && "bg-paper/60",
          !included && "opacity-55",
        )}
        draggable
        onDragStart={onDragStart}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <span
          aria-hidden
          className="cursor-grab pt-1 text-[12px] leading-none text-plus opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          title="Drag to reorder"
        >
          ⋮⋮
        </span>

        <input
          type="checkbox"
          checked={included}
          onChange={onToggle}
          className="mt-1.5 shrink-0"
          aria-label={`Show ${entry.authorName} on your site`}
        />

        <div className="min-w-0 flex-1">
          {/* The words first, at reading size. They are the record. */}
          <blockquote className="m-0 text-[14px] leading-[1.55] text-ink">
            &ldquo;{entry.body}&rdquo;
          </blockquote>

          <div className="mt-3 flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1a5c51]/12 text-[10px] font-semibold text-[#1a5c51]"
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="m-0 truncate text-[13px] font-semibold text-ink">
                {entry.authorName}
              </p>
              {roleLine ? (
                <p className="m-0 truncate text-[12px] leading-snug text-muted">
                  {roleLine}
                </p>
              ) : null}
            </div>
            {entry.belowCut && included ? (
              <span className="ml-auto shrink-0 rounded-full bg-paper px-2 py-1 text-[10px] font-semibold tracking-[0.1em] text-plus uppercase">
                Below cut
              </span>
            ) : null}
            {!included ? (
              <span className="ml-auto shrink-0 rounded-full bg-paper px-2 py-1 text-[10px] font-semibold tracking-[0.1em] text-plus uppercase">
                Hidden
              </span>
            ) : null}
          </div>
        </div>
      </li>
    </>
  );
}
