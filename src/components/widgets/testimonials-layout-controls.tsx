"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { saveTestimonialLimit } from "@/features/testimonials/testimonials-studio-actions";
import { cn } from "@/lib/cn";

type Props = {
  limit: number;
  includedCount: number;
  totalCount: number;
};

export function TestimonialsLayoutControls({
  limit,
  includedCount,
  totalCount,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

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
      {/* The layout pills used to live here. `TestimonialsLayoutGallery` now
          makes that choice with the shape and the fit count on each option, and
          two pickers for one setting is one too many. This keeps the limit,
          which the gallery deliberately does not touch. */}
    </div>
  );
}
