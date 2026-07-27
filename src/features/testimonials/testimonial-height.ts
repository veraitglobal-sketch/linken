import type { TestimonialLayout } from "@/features/testimonials/settings";
import { TESTIMONIAL_LAYOUTS } from "@/features/testimonials/settings";

export function testimonialHeight(layout: TestimonialLayout, count: number): number {
  const n = Math.max(1, Math.min(count, 6));
  const map: Record<TestimonialLayout, number> = {
    single: 200,
    featured: 240,
    editorial: 280 + Math.min(n - 1, 2) * 72,
    strip: 120,
    grid: 80 + Math.ceil(n / 2) * 140,
    masonry: 80 + Math.ceil(n / 2) * 160,
    carousel: 220,
    marquee: 140,
  };
  return map[layout] ?? 280;
}

export const TESTIMONIAL_LAYOUT_LABELS: Record<TestimonialLayout, string> = {
  single: "Single",
  featured: "Featured",
  editorial: "Editorial",
  strip: "Strip",
  grid: "Grid",
  masonry: "Masonry",
  carousel: "Carousel",
  marquee: "Marquee",
};

export const STUDIO_LAYOUT_OPTIONS = TESTIMONIAL_LAYOUTS.map((id) => ({
  id,
  label: TESTIMONIAL_LAYOUT_LABELS[id],
}));
