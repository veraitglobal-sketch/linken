import {
  defaultTestimonialsSettings,
  parseTestimonialLayout,
  parseTestimonialsLimit,
  type TestimonialLayout,
  type TestimonialsSettings,
} from "@/features/testimonials/settings";
import type { TestimonialPreset, TestimonialThemeTokens } from "@/features/testimonials/theme/presets";
import {
  parseTestimonialTheme,
  themeTokensFromPreset,
} from "@/features/testimonials/theme/parse";

/** Merge testimonials widget_settings — omitted keys stay unchanged. */
export function mergeTestimonialsPatch(
  current: unknown,
  patch: {
    excludedIds?: string[];
    order?: string[];
    layout?: TestimonialLayout;
    limit?: number;
    theme?: Partial<TestimonialThemeTokens> | TestimonialPreset | Record<string, unknown>;
  },
): Record<string, unknown> {
  const base =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as Record<string, unknown>) }
      : {};
  const prev =
    base.testimonials &&
    typeof base.testimonials === "object" &&
    !Array.isArray(base.testimonials)
      ? { ...(base.testimonials as Record<string, unknown>) }
      : {};
  const d = defaultTestimonialsSettings();

  const next: TestimonialsSettings = {
    excludedIds:
      patch.excludedIds ??
      (Array.isArray(prev.excludedIds)
        ? prev.excludedIds.filter((id): id is string => typeof id === "string")
        : d.excludedIds),
    order:
      patch.order ??
      (Array.isArray(prev.order)
        ? prev.order.filter((id): id is string => typeof id === "string")
        : d.order),
    layout:
      patch.layout !== undefined
        ? parseTestimonialLayout(patch.layout)
        : parseTestimonialLayout(prev.layout),
    limit:
      patch.limit !== undefined
        ? parseTestimonialsLimit(patch.limit)
        : parseTestimonialsLimit(prev.limit),
    theme: mergeThemePatch(prev.theme, patch.theme),
  };

  return { ...base, testimonials: next };
}

function mergeThemePatch(
  prevRaw: unknown,
  patch:
    | Partial<TestimonialThemeTokens>
    | TestimonialPreset
    | Record<string, unknown>
    | undefined,
): TestimonialThemeTokens {
  const current = parseTestimonialTheme(prevRaw);
  if (!patch) return current;
  if (typeof patch === "string") return themeTokensFromPreset(patch);
  return parseTestimonialTheme({ ...current, ...patch });
}

export function mergeTestimonialsTheme(
  current: unknown,
  theme: Partial<TestimonialThemeTokens> | TestimonialPreset,
): Record<string, unknown> {
  return mergeTestimonialsPatch(current, { theme });
}

export function mergeTestimonialsExcluded(
  current: unknown,
  excludedIds: string[],
): Record<string, unknown> {
  return mergeTestimonialsPatch(current, { excludedIds });
}

export function mergeTestimonialsOrder(
  current: unknown,
  order: string[],
): Record<string, unknown> {
  return mergeTestimonialsPatch(current, { order });
}

export function mergeTestimonialsLayout(
  current: unknown,
  layout: TestimonialLayout,
): Record<string, unknown> {
  return mergeTestimonialsPatch(current, { layout });
}

export function mergeTestimonialsLimit(
  current: unknown,
  limit: number,
): Record<string, unknown> {
  return mergeTestimonialsPatch(current, { limit });
}
