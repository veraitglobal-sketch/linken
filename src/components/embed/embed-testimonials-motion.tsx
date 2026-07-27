"use client";

import { useEffect, useState } from "react";
import { EmbedTestimonialCard } from "@/components/embed/embed-testimonial-card";
import type { PublicTestimonial } from "@/features/testimonials/types";
import { cn } from "@/lib/cn";

type Props = {
  items: PublicTestimonial[];
  profileUrl: string;
  mode: "carousel" | "marquee";
};

export function EmbedTestimonialsMotion({ items, profileUrl, mode }: Props) {
  const [index, setIndex] = useState(0);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (mode !== "carousel" || reduced || items.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [items.length, mode, reduced]);

  if (mode === "marquee" && items.length > 1 && !reduced) {
    const loop = [...items, ...items];
    return (
      <div className="overflow-hidden py-1">
        <div className="flex w-max animate-[linken-marquee_40s_linear_infinite] gap-4">
          {loop.map((item, i) => (
            <div key={`${item.id}-${i}`} className="w-[min(280px,70vw)] shrink-0">
              <EmbedTestimonialCard item={item} profileUrl={profileUrl} compact />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const item = items[index] ?? items[0];
  if (!item) return null;

  return (
    <div className="space-y-3">
      <EmbedTestimonialCard item={item} profileUrl={profileUrl} featured />
      {mode === "carousel" && items.length > 1 ? (
        <div className="flex justify-center gap-1.5">
          {items.map((t, i) => (
            <button
              key={t.id}
              type="button"
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === index ? "bg-current opacity-80" : "bg-current opacity-25",
              )}
              style={{ color: "var(--hs-tm-accent)" }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
