import type { TestimonialLayout } from "@/features/testimonials/settings";
import { TESTIMONIAL_LAYOUTS } from "@/features/testimonials/settings";

/** The masked window the columns drift behind. */
export const WALL_WINDOW = 560;
/**
 * The "Hansala / Verified" lockup row above the window, outside the mask.
 *
 * 44 of it is the lockup; the rest is the gap down to the first card. At 48 the
 * seal sat almost on top of the cards, and because the first card is already
 * being faded by the mask the two read as one crowded object.
 */
export const WALL_HEADER = 76;
/** Of which the lockup itself occupies this much. */
export const WALL_LOCKUP = 44;

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
    /* Fixed, and deliberately not a function of `count`. The wall is a window
       onto a list longer than it — growing it with the record count would close
       exactly the gap the layout exists to show. The header sits above the
       masked window, so it is added rather than taken out of it. */
    wall: WALL_WINDOW + WALL_HEADER,
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
  wall: "Wall",
};

export const STUDIO_LAYOUT_OPTIONS = TESTIMONIAL_LAYOUTS.map((id) => ({
  id,
  label: TESTIMONIAL_LAYOUT_LABELS[id],
}));
