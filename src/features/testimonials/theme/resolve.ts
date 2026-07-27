import type { CSSProperties } from "react";
import type { TestimonialThemeTokens } from "@/features/testimonials/theme/presets";
import { googleFontStylesheet } from "@/features/testimonials/theme/google-font";

const SHADOW: Record<TestimonialThemeTokens["shadow"], string> = {
  none: "none",
  soft: "0 8px 24px rgba(10,23,20,0.08)",
  lifted: "0 14px 40px rgba(10,23,20,0.14)",
};

export type ResolvedTestimonialTheme = {
  tokens: TestimonialThemeTokens;
  style: CSSProperties;
  googleFontHref: string | null;
  customCss: string;
};

export function resolveTestimonialTheme(
  tokens: TestimonialThemeTokens,
): ResolvedTestimonialTheme {
  const style: CSSProperties = {
    fontFamily: tokens.fontFamily,
    fontSize: `${tokens.fontSize}px`,
    lineHeight: tokens.lineHeight,
    color: tokens.textColor,
    background: tokens.background === "transparent" ? "transparent" : tokens.background,
    textAlign: tokens.align,
    ["--hs-tm-text" as string]: tokens.textColor,
    ["--hs-tm-muted" as string]: tokens.mutedColor,
    ["--hs-tm-accent" as string]: tokens.accentColor,
    ["--hs-tm-card-bg" as string]: tokens.cardBackground,
    ["--hs-tm-border" as string]: tokens.borderColor,
    ["--hs-tm-border-w" as string]: `${tokens.borderWidth}px`,
    ["--hs-tm-radius" as string]: `${tokens.radius}px`,
    ["--hs-tm-spacing" as string]: `${tokens.spacing}px`,
    ["--hs-tm-shadow" as string]: SHADOW[tokens.shadow],
  };

  return {
    tokens,
    style,
    googleFontHref: googleFontStylesheet(tokens.fontFamily),
    customCss: tokens.customCss,
  };
}
