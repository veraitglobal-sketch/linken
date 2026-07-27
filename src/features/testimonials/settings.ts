import type { TestimonialThemeTokens } from "@/features/testimonials/theme/presets";
import {
  defaultTestimonialTheme,
  parseTestimonialTheme,
} from "@/features/testimonials/theme/parse";

export type { TestimonialThemeTokens } from "@/features/testimonials/theme/presets";

export type TestimonialLayout =
  | "single"
  | "carousel"
  | "grid"
  | "masonry"
  | "marquee"
  | "editorial"
  | "featured"
  | "strip";

export const TESTIMONIAL_LAYOUTS: TestimonialLayout[] = [
  "single",
  "carousel",
  "grid",
  "masonry",
  "marquee",
  "editorial",
  "featured",
  "strip",
];

export type TestimonialsSettings = {
  excludedIds: string[];
  order: string[];
  layout: TestimonialLayout;
  limit: number;
  theme: TestimonialThemeTokens;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function parseTestimonialLayout(raw: unknown): TestimonialLayout {
  if (typeof raw === "string" && TESTIMONIAL_LAYOUTS.includes(raw as TestimonialLayout)) {
    return raw as TestimonialLayout;
  }
  return "grid";
}

export function parseTestimonialsLimit(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return clamp(Math.round(raw), 1, 30);
  }
  return 12;
}

export function defaultTestimonialsSettings(): TestimonialsSettings {
  return {
    excludedIds: [],
    order: [],
    layout: "grid",
    limit: 12,
    theme: defaultTestimonialTheme(),
  };
}

export function parseTestimonialsSettings(raw: unknown): TestimonialsSettings {
  const d = defaultTestimonialsSettings();
  const obj =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const excluded = Array.isArray(obj.excludedIds)
    ? obj.excludedIds.filter((id): id is string => typeof id === "string")
    : Array.isArray(obj.excluded_ids)
      ? obj.excluded_ids.filter((id): id is string => typeof id === "string")
      : [];
  const order = Array.isArray(obj.order)
    ? obj.order.filter((id): id is string => typeof id === "string")
    : [];

  return {
    excludedIds: excluded,
    order,
    layout: parseTestimonialLayout(obj.layout),
    limit: parseTestimonialsLimit(obj.limit),
    theme: parseTestimonialTheme(obj.theme),
  };
}
