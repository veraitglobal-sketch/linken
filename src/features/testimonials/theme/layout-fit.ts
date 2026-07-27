import type { TestimonialLayout } from "@/features/testimonials/settings";

export type LayoutFitRule = {
  maxChars: number;
  minCount: number;
  maxCount: number;
  label: string;
};

export const LAYOUT_FIT: Record<TestimonialLayout, LayoutFitRule> = {
  single: { maxChars: 600, minCount: 1, maxCount: 1, label: "one full quote" },
  featured: { maxChars: 500, minCount: 1, maxCount: 1, label: "one featured quote" },
  editorial: { maxChars: 420, minCount: 1, maxCount: 6, label: "one lead + shorter support quotes" },
  strip: { maxChars: 180, minCount: 1, maxCount: 12, label: "short quotes only" },
  grid: { maxChars: 320, minCount: 1, maxCount: 12, label: "medium-length quotes" },
  masonry: { maxChars: 380, minCount: 1, maxCount: 12, label: "medium-length quotes" },
  carousel: { maxChars: 400, minCount: 1, maxCount: 12, label: "medium-length quotes" },
  marquee: { maxChars: 140, minCount: 2, maxCount: 12, label: "short quotes" },
};

export function testimonialFitsLayout(body: string, layout: TestimonialLayout): boolean {
  return body.trim().length <= LAYOUT_FIT[layout].maxChars;
}

export function filterForLayout<T extends { body: string }>(
  items: T[],
  layout: TestimonialLayout,
): T[] {
  return items.filter((item) => testimonialFitsLayout(item.body, layout));
}

export function layoutFitWarnings(
  entries: { id: string; body: string; authorName: string; included: boolean }[],
  layout: TestimonialLayout,
): string[] {
  const rule = LAYOUT_FIT[layout];
  const included = entries.filter((e) => e.included);
  const warnings: string[] = [];
  const tooLong = included.filter((e) => !testimonialFitsLayout(e.body, layout));
  if (tooLong.length) {
    warnings.push(
      `${tooLong.length} included testimonial(s) exceed ${rule.maxChars} characters for ${layout} — they will not render (no truncation).`,
    );
  }
  const fitting = included.filter((e) => testimonialFitsLayout(e.body, layout));
  if (fitting.length < rule.minCount) {
    warnings.push(`Layout "${layout}" needs at least ${rule.minCount} fitting quote(s).`);
  }
  if (layout === "marquee" && fitting.length < 2) {
    warnings.push("Marquee works best with at least two short quotes.");
  }
  return warnings;
}
