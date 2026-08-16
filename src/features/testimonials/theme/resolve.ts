import type { CSSProperties } from "react";
import type { TestimonialThemeTokens } from "@/features/testimonials/theme/presets";
import { googleFontStylesheet } from "@/features/testimonials/theme/google-font";

/**
 * Layered, not a single blur.
 *
 * One soft shadow spreads the card's edge over 24px and the edge stops being an
 * edge — paired with a 1px border at 7% it read as a smudge with a line drawn
 * near it. The half-pixel ring does the containing, and the two blurs do the
 * lifting: a close, tight one for the contact shadow and a wide, faint one for
 * the ambient. Precision at the boundary is most of what reads as expensive.
 *
 * A card can now drop `borderWidth` to 0 and still be crisply bounded, which is
 * what the wall does — a 1px border and a 0.5px ring together are two edges.
 */
const SHADOW: Record<TestimonialThemeTokens["shadow"], string> = {
  none: "none",
  soft: [
    "0 0 0 0.5px rgba(10,23,20,0.10)",
    "0 2px 6px -2px rgba(10,23,20,0.06)",
    "0 10px 24px -8px rgba(10,23,20,0.10)",
  ].join(","),
  lifted: [
    "0 0 0 0.5px rgba(10,23,20,0.12)",
    "0 4px 10px -3px rgba(10,23,20,0.08)",
    "0 18px 40px -12px rgba(10,23,20,0.16)",
  ].join(","),
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
