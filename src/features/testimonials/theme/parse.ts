import {
  PRESET_TOKENS,
  TESTIMONIAL_PRESETS,
  type TestimonialAlign,
  type TestimonialPreset,
  type TestimonialShadow,
  type TestimonialThemeTokens,
} from "@/features/testimonials/theme/presets";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function parseHex(raw: unknown, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  const v = raw.trim();
  if (v === "transparent") return "transparent";
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v;
  if (/^rgba?\([^)]+\)$/.test(v)) return v;
  return fallback;
}

function parsePreset(raw: unknown): TestimonialPreset {
  if (typeof raw === "string" && TESTIMONIAL_PRESETS.includes(raw as TestimonialPreset)) {
    return raw as TestimonialPreset;
  }
  return "minimal";
}

function parseShadow(raw: unknown, fallback: TestimonialShadow): TestimonialShadow {
  if (raw === "none" || raw === "soft" || raw === "lifted") return raw;
  return fallback;
}

function parseAlign(raw: unknown, fallback: TestimonialAlign): TestimonialAlign {
  return raw === "center" ? "center" : fallback;
}

function parseFontFamily(raw: unknown, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  const v = raw.trim().slice(0, 200);
  if (!v || /[<>{}]/.test(v)) return fallback;
  return v;
}

function parseCustomCss(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const v = raw.trim().slice(0, 4000);
  if (!v || /<\/style/i.test(v) || /@import/i.test(v)) return "";
  return v;
}

export function defaultTestimonialTheme(): TestimonialThemeTokens {
  return { ...PRESET_TOKENS.minimal };
}

export function parseTestimonialTheme(raw: unknown): TestimonialThemeTokens {
  const preset = parsePreset(
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>).preset
      : undefined,
  );
  const base = { ...PRESET_TOKENS[preset] };
  const o =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  return {
    preset,
    fontFamily: parseFontFamily(o.fontFamily ?? o.font_family, base.fontFamily),
    fontSize: clamp(
      typeof o.fontSize === "number"
        ? o.fontSize
        : typeof o.font_size === "number"
          ? o.font_size
          : base.fontSize,
      12,
      22,
    ),
    lineHeight: clamp(
      typeof o.lineHeight === "number"
        ? o.lineHeight
        : typeof o.line_height === "number"
          ? o.line_height
          : base.lineHeight,
      1.2,
      2,
    ),
    textColor: parseHex(o.textColor ?? o.text_color, base.textColor),
    mutedColor: parseHex(o.mutedColor ?? o.muted_color, base.mutedColor),
    accentColor: parseHex(o.accentColor ?? o.accent_color, base.accentColor),
    background: parseHex(o.background, base.background),
    cardBackground: parseHex(o.cardBackground ?? o.card_background, base.cardBackground),
    borderColor: parseHex(o.borderColor ?? o.border_color, base.borderColor),
    borderWidth: clamp(
      typeof o.borderWidth === "number"
        ? o.borderWidth
        : typeof o.border_width === "number"
          ? o.border_width
          : base.borderWidth,
      0,
      4,
    ),
    radius: clamp(typeof o.radius === "number" ? o.radius : base.radius, 0, 32),
    shadow: parseShadow(o.shadow, base.shadow),
    spacing: clamp(typeof o.spacing === "number" ? o.spacing : base.spacing, 4, 32),
    align: parseAlign(o.align, base.align),
    customCss: parseCustomCss(o.customCss ?? o.custom_css),
  };
}

export function themeTokensFromPreset(preset: TestimonialPreset): TestimonialThemeTokens {
  return { ...PRESET_TOKENS[preset], preset };
}
