"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { TestimonialLayout } from "@/features/testimonials/settings";
import {
  saveTestimonialLayout,
  saveTestimonialLimit,
} from "@/features/testimonials/testimonials-studio-actions";
import { STUDIO_LAYOUT_OPTIONS } from "@/features/testimonials/testimonial-height";
import { cn } from "@/lib/cn";

type Props = {
  layout: TestimonialLayout;
  limit: number;
  includedCount: number;
  totalCount: number;
};

export function TestimonialsLayoutControls({
  layout,
  limit,
  includedCount,
  totalCount,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function pickLayout(next: TestimonialLayout) {
    startTransition(async () => {
      await saveTestimonialLayout(next);
      router.refresh();
    });
  }

  function onLimitChange(value: number) {
    startTransition(async () => {
      await saveTestimonialLimit(value);
      router.refresh();
    });
  }

  return (
    <div className={cn("mt-4 space-y-4", pending && "opacity-70")}>
      <p className="text-[12px] text-muted">
        Showing up to {limit} of {includedCount} included ({totalCount} published)
      </p>
      <label className="block">
        <span className="text-[12px] font-medium text-ink">Limit</span>
        <input
          type="range"
          min={1}
          max={30}
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="mt-2 w-full max-w-xs"
        />
      </label>
      <div>
        <p className="text-[12px] font-medium text-ink">Layout</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STUDIO_LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => pickLayout(opt.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                layout === opt.id
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-surface text-ink hover:border-ink/30",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
