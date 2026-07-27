import {
  parseTestimonialLayout,
  parseTestimonialsLimit,
  TESTIMONIAL_LAYOUTS,
  type TestimonialLayout,
} from "@/features/testimonials/settings";
import { mergeTestimonialsPatch } from "@/features/testimonials/testimonials-merge";

export function patchFromTestimonialsObject(
  o: Record<string, unknown>,
): {
  ok: true;
  patch: {
    excludedIds?: string[];
    order?: string[];
    layout?: TestimonialLayout;
    limit?: number;
    theme?: Record<string, unknown>;
  };
} | { ok: false; error: string } {
  const patch: {
    excludedIds?: string[];
    order?: string[];
    layout?: TestimonialLayout;
    limit?: number;
    theme?: Record<string, unknown>;
  } = {};

  const excludedRaw = o.excluded_ids ?? o.excludedIds;
  if (excludedRaw !== undefined) {
    if (!Array.isArray(excludedRaw)) {
      return { ok: false, error: "testimonials excluded ids must be an array." };
    }
    patch.excludedIds = excludedRaw.filter(
      (id): id is string => typeof id === "string",
    );
  }

  if ("order" in o) {
    if (!Array.isArray(o.order)) {
      return { ok: false, error: "testimonials.order must be an array." };
    }
    patch.order = o.order.filter((id): id is string => typeof id === "string");
  }

  if ("layout" in o) {
    const layout = parseTestimonialLayout(o.layout);
    if (
      typeof o.layout === "string" &&
      !TESTIMONIAL_LAYOUTS.includes(layout) &&
      o.layout !== layout
    ) {
      return { ok: false, error: "testimonials.layout invalid." };
    }
    patch.layout = layout;
  }

  if ("limit" in o) {
    if (typeof o.limit !== "number" || !Number.isFinite(o.limit)) {
      return { ok: false, error: "testimonials.limit must be a number." };
    }
    patch.limit = parseTestimonialsLimit(o.limit);
  }

  if ("theme" in o) {
    if (!o.theme || typeof o.theme !== "object" || Array.isArray(o.theme)) {
      return { ok: false, error: "testimonials.theme must be an object." };
    }
    patch.theme = o.theme as Record<string, unknown>;
  }

  return { ok: true, patch };
}

export function applyTestimonialsPatch(
  current: unknown,
  o: Record<string, unknown>,
):
  | { ok: true; widgetSettings: unknown }
  | { ok: false; error: string } {
  const patched = patchFromTestimonialsObject(o);
  if (!patched.ok) return patched;
  return {
    ok: true,
    widgetSettings: mergeTestimonialsPatch(current, patched.patch),
  };
}
