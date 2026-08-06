import type {
  TestimonialPreset,
  TestimonialThemeTokens,
} from "@/features/testimonials/theme/presets";
import { PRESET_TOKENS } from "@/features/testimonials/theme/presets";

const SHADOW: Record<TestimonialThemeTokens["shadow"], string> = {
  none: "none",
  soft: "0 8px 24px rgba(10,23,20,0.08)",
  lifted: "0 14px 40px rgba(10,23,20,0.14)",
};

export type PublicThemePayload = {
  preset: TestimonialPreset;
  font_family: string;
  font_size: number;
  line_height: number;
  text_color: string;
  muted_color: string;
  accent_color: string;
  background: string;
  card_background: string;
  border_color: string;
  border_width: number;
  radius: number;
  shadow: TestimonialThemeTokens["shadow"];
  spacing: number;
  align: TestimonialThemeTokens["align"];
  /** Upper bound only — a consumer still resolves the real count from its
   *  own container width, exactly as the iframe embed does. */
  max_columns: TestimonialThemeTokens["maxColumns"];
  css_vars: Record<string, string>;
};

/** Safe theme for any host — no customCss (XSS). */
export function toPublicTheme(tokens: TestimonialThemeTokens): PublicThemePayload {
  return {
    preset: tokens.preset,
    font_family: tokens.fontFamily,
    font_size: tokens.fontSize,
    line_height: tokens.lineHeight,
    text_color: tokens.textColor,
    muted_color: tokens.mutedColor,
    accent_color: tokens.accentColor,
    background: tokens.background,
    card_background: tokens.cardBackground,
    border_color: tokens.borderColor,
    border_width: tokens.borderWidth,
    radius: tokens.radius,
    shadow: tokens.shadow,
    spacing: tokens.spacing,
    align: tokens.align,
    max_columns: tokens.maxColumns,
    css_vars: {
      "--hs-tm-text": tokens.textColor,
      "--hs-tm-muted": tokens.mutedColor,
      "--hs-tm-accent": tokens.accentColor,
      "--hs-tm-card-bg": tokens.cardBackground,
      "--hs-tm-border": tokens.borderColor,
      "--hs-tm-border-w": `${tokens.borderWidth}px`,
      "--hs-tm-radius": `${tokens.radius}px`,
      "--hs-tm-spacing": `${tokens.spacing}px`,
      "--hs-tm-shadow": SHADOW[tokens.shadow],
      "--hs-tm-max-cols": String(tokens.maxColumns),
    },
  };
}

export function defaultPublicTheme(): PublicThemePayload {
  return toPublicTheme(PRESET_TOKENS.minimal);
}
